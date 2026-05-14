import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getInstagramPosts } from "@/lib/instagram/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const igAccount = await db.instagramAccount.findUnique({
    where: { userId },
  });

  if (!igAccount) {
    return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 });
  }

  try {
    const posts = await getInstagramPosts(igAccount.accessToken);
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
