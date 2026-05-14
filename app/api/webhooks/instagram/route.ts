import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendInstagramDM, replyToComment } from "@/lib/instagram/client";
import { runSmartAI } from "@/lib/openai/smartai";

// Webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Webhook events (POST)
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Process each entry asynchronously (don't block response)
  processWebhookEntries(body).catch(console.error);

  return NextResponse.json({ received: true });
}

async function processWebhookEntries(body: any) {
  const entries = body.entry ?? [];

  for (const entry of entries) {
    const instagramAccountId = entry.id;

    // Find the Instagram account in our DB
    const igAccount = await db.instagramAccount.findUnique({
      where: { instagramId: instagramAccountId },
    });
    if (!igAccount) continue;

    // Handle messaging (DMs)
    if (entry.messaging) {
      for (const msg of entry.messaging) {
        const senderId = msg.sender?.id;
        const text: string = msg.message?.text ?? "";
        if (!senderId || !text || senderId === instagramAccountId) continue;

        await handleDMTrigger({
          userId: igAccount.userId,
          accessToken: igAccount.accessToken,
          senderId,
          text,
        });
      }
    }

    // Handle comment changes
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field !== "comments") continue;
        const { from, text, media } = change.value ?? {};
        const senderId = from?.id;
        const mediaId = media?.id;
        if (!senderId || !text) continue;

        await handleCommentTrigger({
          userId: igAccount.userId,
          accessToken: igAccount.accessToken,
          senderId,
          text,
          mediaId,
        });
      }
    }
  }
}

async function handleDMTrigger({
  userId,
  accessToken,
  senderId,
  text,
}: {
  userId: string;
  accessToken: string;
  senderId: string;
  text: string;
}) {
  // Find active DM automations for this user
  const automations = await db.automation.findMany({
    where: { userId, active: true },
    include: { trigger: true, listener: true },
  });

  const dmAutomations = automations.filter((a) => a.trigger?.type === "DM");

  for (const automation of dmAutomations) {
    const keywords = automation.trigger?.keywords ?? [];
    const matched = keywords.some((kw) =>
      text.toLowerCase().includes(kw.toLowerCase())
    );
    if (!matched) continue;

    // Check if lead already exists for this automation
    const existingLog = await db.dmLog.findUnique({
      where: { automationId_senderId: { automationId: automation.id, senderId } },
    });

    if (automation.listener?.type === "MESSAGE") {
      // Send fixed message — only if new lead OR no prior conversation
      if (!existingLog) {
        const msg = automation.listener.message ?? "";
        await sendInstagramDM({ accessToken, recipientId: senderId, message: msg });

        await db.dmLog.create({
          data: {
            automationId: automation.id,
            senderId,
            messages: [
              { role: "user", content: text, timestamp: new Date().toISOString() },
              { role: "assistant", content: msg, timestamp: new Date().toISOString() },
            ],
          },
        });
      }
    } else if (automation.listener?.type === "SMART_AI") {
      const history: Array<{ role: string; content: string }> =
        (existingLog?.messages as any[]) ?? [];

      // Append new user message
      const updatedHistory = [
        ...history,
        { role: "user", content: text, timestamp: new Date().toISOString() },
      ];

      // Run Smart AI
      const aiReply = await runSmartAI({
        systemPrompt: automation.listener.prompt ?? "You are a helpful assistant.",
        history: updatedHistory.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      });

      // Send AI reply
      await sendInstagramDM({ accessToken, recipientId: senderId, message: aiReply });

      // Save conversation
      const finalHistory = [
        ...updatedHistory,
        { role: "assistant", content: aiReply, timestamp: new Date().toISOString() },
      ];

      if (existingLog) {
        await db.dmLog.update({
          where: { id: existingLog.id },
          data: { messages: finalHistory },
        });
      } else {
        await db.dmLog.create({
          data: {
            automationId: automation.id,
            senderId,
            messages: finalHistory,
          },
        });
      }
    }

    break; // Only fire first matching automation
  }
}

async function handleCommentTrigger({
  userId,
  accessToken,
  senderId,
  text,
  mediaId,
}: {
  userId: string;
  accessToken: string;
  senderId: string;
  text: string;
  mediaId?: string;
}) {
  const automations = await db.automation.findMany({
    where: { userId, active: true },
    include: { trigger: true, listener: true, posts: true },
  });

  const commentAutomations = automations.filter(
    (a) => a.trigger?.type === "COMMENT"
  );

  for (const automation of commentAutomations) {
    // Check if post matches (if posts attached)
    if (automation.posts.length > 0 && mediaId) {
      const postIds = automation.posts.map((p) => p.instagramId);
      if (!postIds.includes(mediaId)) continue;
    }

    const keywords = automation.trigger?.keywords ?? [];
    const matched = keywords.some((kw) =>
      text.toLowerCase().includes(kw.toLowerCase())
    );
    if (!matched) continue;

    const listener = automation.listener;
    if (!listener) continue;

    // Reply to comment publicly if configured
    if (listener.commentReply) {
      await replyToComment({
        accessToken,
        commentText: listener.commentReply,
        mediaId: mediaId ?? "",
      });
    }

    // Send DM
    if (listener.type === "MESSAGE" && listener.message) {
      await sendInstagramDM({
        accessToken,
        recipientId: senderId,
        message: listener.message,
      });
    } else if (listener.type === "SMART_AI") {
      const aiReply = await runSmartAI({
        systemPrompt: listener.prompt ?? "You are a helpful assistant.",
        history: [{ role: "user", content: text }],
      });
      await sendInstagramDM({ accessToken, recipientId: senderId, message: aiReply });
    }

    break;
  }
}
