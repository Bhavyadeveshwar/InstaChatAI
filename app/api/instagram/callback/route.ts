import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL("/auth/sign-in", req.url)
    );
  }

  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("Instagram OAuth Error:", error);

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?error=instagram_denied",
        req.url
      )
    );
  }

  try {
    /**
     * STEP 1
     * Exchange auth code for access token
     */

    const tokenRes = await axios.get(
      "https://graph.facebook.com/v22.0/oauth/access_token",
      {
        params: {
          client_id: process.env.INSTAGRAM_APP_ID,
          client_secret: process.env.INSTAGRAM_APP_SECRET,
          redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
          code,
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    /**
     * STEP 2
     * Get Facebook Pages connected to user
     */

    const pagesRes = await axios.get(
      "https://graph.facebook.com/v22.0/me/accounts",
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    const pages = pagesRes.data.data;

    if (!pages || pages.length === 0) {
      throw new Error("No Facebook Pages found");
    }

    /**
     * STEP 3
     * Find page connected to Instagram Business Account
     */

    let instagramAccount = null;

    for (const page of pages) {
      const pageDetailsRes = await axios.get(
        `https://graph.facebook.com/v22.0/${page.id}`,
        {
          params: {
            fields: "instagram_business_account",
            access_token: page.access_token,
          },
        }
      );

      if (pageDetailsRes.data.instagram_business_account) {
        instagramAccount = {
          pageAccessToken: page.access_token,
          instagramBusinessId:
            pageDetailsRes.data.instagram_business_account.id,
        };

        break;
      }
    }

    if (!instagramAccount) {
      throw new Error(
        "No Instagram Business Account connected to any Facebook Page"
      );
    }

    /**
     * STEP 4
     * Get Instagram profile details
     */

    const profileRes = await axios.get(
      `https://graph.facebook.com/v22.0/${instagramAccount.instagramBusinessId}`,
      {
        params: {
          fields: "id,username,profile_picture_url",
          access_token: instagramAccount.pageAccessToken,
        },
      }
    );

    const profile = profileRes.data;

    /**
     * STEP 5
     * Save account in database
     */

    await db.instagramAccount.upsert({
      where: {
        userId,
      },

      create: {
        userId,
        instagramId: profile.id,
        username: profile.username,
        accessToken: instagramAccount.pageAccessToken,
      },

      update: {
        instagramId: profile.id,
        username: profile.username,
        accessToken: instagramAccount.pageAccessToken,
      },
    });

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?success=instagram_connected",
        req.url
      )
    );
  } catch (err: any) {
    console.error(
      "Instagram Business Login Error:",
      err?.response?.data || err.message
    );

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?error=instagram_failed",
        req.url
      )
    );
  }
}