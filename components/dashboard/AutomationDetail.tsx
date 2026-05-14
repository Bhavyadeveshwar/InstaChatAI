"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Bot, MessageSquare, Trash2, Tag, ToggleLeft, ToggleRight,
  MessageCircle, ChevronDown, ChevronUp
} from "lucide-react";

interface DmLog {
  id: string;
  senderId: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  updatedAt: string;
}

interface Automation {
  id: string;
  name: string;
  active: boolean;
  trigger?: { type: string; keywords: string[] } | null;
  listener?: { type: string; message?: string | null; prompt?: string | null; commentReply?: string | null } | null;
  posts?: Array<{ id: string; instagramId: string; caption?: string | null }>;
  dmlogs?: DmLog[];
}

export default function AutomationDetail({ automation: initial }: { automation: Automation }) {
  const router = useRouter();
  const [automation, setAutomation] = useState(initial);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toggleActive = async () => {
    const res = await fetch(`/api/automations/${automation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !automation.active }),
    });
    if (res.ok) {
      setAutomation((a) => ({ ...a, active: !a.active }));
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this automation? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/automations/${automation.id}`, { method: "DELETE" });
    router.push("/dashboard/automations");
  };

  return (
    <div className="animate-fadeIn max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{automation.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${automation.active ? "bg-green-500" : "bg-[var(--surface-border)]"}`}
            />
            <span className="text-sm text-[var(--text-muted)]">
              {automation.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleActive}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              automation.active
                ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "border-[var(--surface-border)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {automation.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {automation.active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Trigger card */}
      <div className="glass rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-[var(--brand)]" />
          <h2 className="font-semibold">Trigger</h2>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-[var(--brand)]/20 text-[var(--brand)] rounded-full text-sm font-medium">
            {automation.trigger?.type ?? "—"}
          </span>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Keywords</p>
          <div className="flex flex-wrap gap-2">
            {(automation.trigger?.keywords ?? []).length === 0 ? (
              <span className="text-sm text-[var(--text-muted)]">No keywords set</span>
            ) : (
              automation.trigger?.keywords.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1 px-3 py-1 bg-[var(--surface)] border border-[var(--surface-border)] rounded-full text-sm"
                >
                  <Tag size={11} className="text-[var(--text-muted)]" />
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Listener card */}
      <div className="glass rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          {automation.listener?.type === "SMART_AI" ? (
            <Bot size={16} className="text-purple-400" />
          ) : (
            <MessageSquare size={16} className="text-blue-400" />
          )}
          <h2 className="font-semibold">
            {automation.listener?.type === "SMART_AI" ? "Smart AI" : "Send Message"}
          </h2>
        </div>

        {automation.listener?.type === "MESSAGE" && (
          <div className="bg-[var(--surface)] rounded-xl p-4 text-sm text-[var(--text-muted)] whitespace-pre-wrap">
            {automation.listener.message || <em>No message configured</em>}
          </div>
        )}

        {automation.listener?.type === "SMART_AI" && (
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">System Prompt</p>
            <div className="bg-[var(--surface)] rounded-xl p-4 text-sm text-[var(--text-muted)] whitespace-pre-wrap">
              {automation.listener.prompt || <em>No prompt configured</em>}
            </div>
          </div>
        )}

        {automation.listener?.commentReply && (
          <div className="mt-4">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Public Comment Reply</p>
            <div className="bg-[var(--surface)] rounded-xl p-3 text-sm">
              {automation.listener.commentReply}
            </div>
          </div>
        )}
      </div>

      {/* Conversations */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={16} className="text-[var(--text-muted)]" />
          <h2 className="font-semibold">Conversations</h2>
          <span className="ml-auto text-sm text-[var(--text-muted)]">
            {automation.dmlogs?.length ?? 0} total
          </span>
        </div>

        {(automation.dmlogs?.length ?? 0) === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">
            No conversations yet. Activate the automation and wait for messages!
          </p>
        ) : (
          <div className="space-y-3">
            {automation.dmlogs?.map((log) => (
              <div key={log.id} className="bg-[var(--surface)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">User {log.senderId.slice(-6)}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {log.messages.length} messages ·{" "}
                      {new Date(log.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {expandedLog === log.id ? (
                    <ChevronUp size={16} className="text-[var(--text-muted)]" />
                  ) : (
                    <ChevronDown size={16} className="text-[var(--text-muted)]" />
                  )}
                </button>

                {expandedLog === log.id && (
                  <div className="px-4 pb-4 space-y-2 border-t border-[var(--surface-border)] pt-3">
                    {log.messages.map((m, i) => (
                      <div
                        key={i}
                        className={`text-sm px-3 py-2 rounded-xl max-w-[85%] ${
                          m.role === "user"
                            ? "bg-[var(--surface-card)] text-[var(--text-muted)]"
                            : "bg-[var(--brand)]/15 text-white ml-auto text-right"
                        }`}
                      >
                        {m.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
