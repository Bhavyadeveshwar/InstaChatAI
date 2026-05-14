import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";


const createSchema = z.object({
  name: z.string().min(1),
  triggerType: z.enum(["DM", "COMMENT"]),
  keywords: z.array(z.string()),
  listenerType: z.enum(["MESSAGE", "SMART_AI"]),
  message: z.string().optional(),
  prompt: z.string().optional(),
  commentReply: z.string().optional(),
});

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const automations = await db.automation.findMany({
    where: { userId },
    include: { trigger: true, listener: true, _count: { select: { dmlogs: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(automations);
}

export async function POST(req: NextRequest) {
  const { userId } =  auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Create user in DB if they don't exist yet
  await db.user.upsert({
    where: { id: userId },
    create: { id: userId, email: "" },
    update: {},
  });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, triggerType, keywords, listenerType, message, prompt, commentReply } =
    parsed.data;

  const count = await db.automation.count({ where: { userId } });
  const subscription = await db.subscription.findUnique({ where: { userId } });
  if (!subscription || subscription.plan === "FREE") {
    if (count >= 3) {
      return NextResponse.json(
        { error: "Free plan limited to 3 automations. Upgrade to Pro." },
        { status: 403 }
      );
    }
  }

  const automation = await db.automation.create({
    data: {
      userId,
      name,
      trigger: {
        create: { type: triggerType, keywords },
      },
      listener: {
        create: { type: listenerType, message, prompt, commentReply },
      },
    },
    include: { trigger: true, listener: true },
  });

  return NextResponse.json(automation);
}