import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { instagramId, caption, mediaUrl } = body;

  const automation = await db.automation.findFirst({
    where: { id: params.id, userId },
  });
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const post = await db.post.create({
    data: {
      automationId: params.id,
      instagramId,
      caption,
      mediaUrl,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();

  const automation = await db.automation.findFirst({
    where: { id: params.id, userId },
  });
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.post.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}