import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";


export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } =  auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const automation = await db.automation.findFirst({
    where: { id: params.id, userId },
    include: { trigger: true, listener: true, posts: true, dmlogs: true },
  });

  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(automation);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } =  auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Verify ownership
  const existing = await db.automation.findFirst({
    where: { id: params.id, userId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Toggle active
  if (typeof body.active === "boolean") {
    const updated = await db.automation.update({
      where: { id: params.id },
      data: { active: body.active },
    });
    return NextResponse.json(updated);
  }

  // Update name
  if (body.name) {
    const updated = await db.automation.update({
      where: { id: params.id },
      data: { name: body.name },
    });
    return NextResponse.json(updated);
  }

  // Update trigger keywords
  if (body.keywords) {
    await db.trigger.update({
      where: { automationId: params.id },
      data: { keywords: body.keywords },
    });
  }

  // Update listener
  if (body.listener) {
    await db.listener.update({
      where: { automationId: params.id },
      data: body.listener,
    });
  }

  const automation = await db.automation.findFirst({
    where: { id: params.id },
    include: { trigger: true, listener: true, posts: true },
  });
  return NextResponse.json(automation);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.automation.findFirst({
    where: { id: params.id, userId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.automation.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
