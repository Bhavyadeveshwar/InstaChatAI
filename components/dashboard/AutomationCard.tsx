"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, MessageSquare, Bot, ChevronRight } from "lucide-react";

interface AutomationCardProps {
  automation: {
    id: string;
    name: string;
    active: boolean;
    trigger?: { type: string; keywords: string[] } | null;
    listener?: { type: string } | null;
    _count?: { dmlogs: number };
  };
}

export default function AutomationCard({ automation }: AutomationCardProps) {
  const [active, setActive] = useState(automation.active);
  const [loading, setLoading] = useState(false);

  const toggleActive = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/automations/${automation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) setActive(!active);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={`/dashboard/automations/${automation.id}`}
      className="glass rounded-xl p-5 card-hover flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        {/* Active indicator */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            active ? "bg-[var(--brand)]/20" : "bg-[var(--surface)]"
          }`}
        >
          <Zap
            size={18}
            className={active ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}
          />
        </div>

        <div>
          <p className="font-medium">{automation.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[var(--text-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-full">
              {automation.trigger?.type ?? "—"}
            </span>
            {automation.listener?.type === "SMART_AI" ? (
              <span className="text-xs text-purple-400 flex items-center gap-1">
                <Bot size={11} /> Smart AI
              </span>
            ) : (
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <MessageSquare size={11} /> Message
              </span>
            )}
            <span className="text-xs text-[var(--text-muted)]">
              · {automation._count?.dmlogs ?? 0} conversations
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle */}
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            active ? "bg-[var(--brand)]" : "bg-[var(--surface-border)]"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <ChevronRight
          size={16}
          className="text-[var(--text-muted)] group-hover:text-white transition-colors"
        />
      </div>
    </Link>
  );
}
