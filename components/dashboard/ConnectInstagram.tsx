"use client";

import { buildInstagramAuthUrl } from "@/lib/instagram/client";
import { Instagram, CheckCircle, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface InstagramAccount {
  id: string;
  username: string;
  instagramId: string;
  tokenExpiresAt?: Date | null;
}

export default function ConnectInstagram({
  account,
}: {
  account: InstagramAccount | null;
}) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const authUrl = buildInstagramAuthUrl();

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Instagram size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold">Instagram</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Connect your Instagram Business account
          </p>
        </div>
      </div>

      {/* Status messages */}
      {success === "instagram_connected" && (
        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 text-sm">
          <CheckCircle size={16} />
          Instagram connected successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16} />
          {error === "instagram_denied"
            ? "Connection was cancelled."
            : "Failed to connect Instagram. Please try again."}
        </div>
      )}

      {account ? (
        <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              {account.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">@{account.username}</p>
              <p className="text-xs text-[var(--text-muted)]">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <a
              href={authUrl}
              className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
            >
              Reconnect
            </a>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            You need to connect an Instagram Business or Creator account to enable
            automations.
          </p>
          <a
            href={authUrl}
            className="btn-brand px-6 py-2.5 rounded-xl text-sm font-medium text-white inline-flex items-center gap-2"
          >
            <Instagram size={16} />
            Connect Instagram
          </a>
        </div>
      )}

      {/* Requirements note */}
      <div className="mt-6 p-4 bg-[var(--surface)] rounded-xl text-xs text-[var(--text-muted)] space-y-1">
        <p className="font-medium text-white mb-2">Requirements</p>
        <p>· Instagram Business or Creator account</p>
        <p>· Connected to a Facebook Page</p>
        <p>· Messaging enabled in Instagram settings</p>
      </div>
    </div>
  );
}
