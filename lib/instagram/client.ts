import axios from "axios";

const GRAPH_URL = "https://graph.instagram.com/v20.0";

export async function sendInstagramDM({
  accessToken,
  recipientId,
  message,
}: {
  accessToken: string;
  recipientId: string;
  message: string;
}) {
  try {
    await axios.post(
      `${GRAPH_URL}/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text: message },
      },
      {
        params: { access_token: accessToken },
      }
    );
  } catch (err: any) {
    console.error(
      "Failed to send Instagram DM:",
      err?.response?.data ?? err.message
    );
    throw err;
  }
}

export async function replyToComment({
  accessToken,
  commentText,
  mediaId,
}: {
  accessToken: string;
  commentText: string;
  mediaId: string;
}) {
  try {
    await axios.post(
      `${GRAPH_URL}/${mediaId}/comments`,
      { message: commentText },
      { params: { access_token: accessToken } }
    );
  } catch (err: any) {
    console.error(
      "Failed to reply to comment:",
      err?.response?.data ?? err.message
    );
    throw err;
  }
}

export async function getInstagramPosts(accessToken: string) {
  const res = await axios.get(`${GRAPH_URL}/me/media`, {
    params: {
      fields: "id,caption,media_url,thumbnail_url,media_type,timestamp",
      access_token: accessToken,
      limit: 20,
    },
  });
  return res.data.data as {
    id: string;
    caption?: string;
    media_url?: string;
    thumbnail_url?: string;
    media_type: string;
    timestamp: string;
  }[];
}

export function buildInstagramAuthUrl() {
  const baseUrl = "https://www.facebook.com/v22.0/dialog/oauth";

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!,
    redirect_uri:
      process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!,
    scope: [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "pages_show_list",
      "pages_read_engagement",
    ].join(","),
    response_type: "code",
  });

  return `${baseUrl}?${params.toString()}`;
}