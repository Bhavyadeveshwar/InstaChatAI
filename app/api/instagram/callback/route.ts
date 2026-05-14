import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/auth/sign-in", req.url));

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=instagram_denied", req.url)
    );
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID!,
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
        code,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token: shortToken, user_id: instagramId } = tokenRes.data;

    // Exchange for long-lived token
    const longTokenRes = await axios.get(
      "https://graph.instagram.com/access_token",
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: process.env.INSTAGRAM_APP_SECRET!,
          access_token: shortToken,
        },
      }
    );

    const { access_token, expires_in } = longTokenRes.data;

    // Get username
    const profileRes = await axios.get(
      `https://graph.instagram.com/${instagramId}`,
      { params: { fields: "id,username", access_token } }
    );

    const { username } = profileRes.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Upsert Instagram account
    await db.instagramAccount.upsert({
      where: { userId },
      create: {
        userId,
        instagramId: String(instagramId),
        username,
        accessToken: access_token,
        tokenExpiresAt: expiresAt,
      },
      update: {
        instagramId: String(instagramId),
        username,
        accessToken: access_token,
        tokenExpiresAt: expiresAt,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/integrations?success=instagram_connected", req.url)
    );
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=instagram_failed", req.url)
    );
  }
}
