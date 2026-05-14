import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Link from "next/link";
import { Zap, MessageSquare, TrendingUp, Plus } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  const automations = await db.automation.findMany({
    where: { userId: userId! },
    include: { trigger: true, listener: true, dmlogs: true },
    orderBy: { createdAt: "desc" },
  });

  const totalDms = automations.reduce((a, b) => a + b.dmlogs.length, 0);
  const active = automations.filter((a) => a.active).length;

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Your Instagram automation overview
          </p>
        </div>
        <Link
          href="/dashboard/automations/new"
          className="btn-brand px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2"
        >
          <Plus size={16} />
          New Automation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          {
            label: "Total Automations",
            value: automations.length,
            icon: Zap,
            color: "#6C47FF",
          },
          {
            label: "Active",
            value: active,
            icon: TrendingUp,
            color: "#22C55E",
          },
          {
            label: "DMs Handled",
            value: totalDms,
            icon: MessageSquare,
            color: "#F59E0B",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-5 card-hover flex items-center gap-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${s.color}22` }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent automations */}
      <h2 className="text-lg font-semibold mb-4">Recent Automations</h2>
      {automations.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Zap size={40} className="mx-auto mb-4 text-[var(--brand)] opacity-40" />
          <p className="text-[var(--text-muted)] mb-4">
            No automations yet. Create your first one!
          </p>
          <Link
            href="/dashboard/automations/new"
            className="btn-brand px-6 py-2 rounded-xl text-sm font-medium text-white inline-block"
          >
            Create Automation
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {automations.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/automations/${a.id}`}
              className="glass rounded-xl p-4 card-hover flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${a.active ? "bg-green-500" : "bg-[var(--surface-border)]"}`}
                />
                <span className="font-medium">{a.name}</span>
                <span className="text-xs text-[var(--text-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-full">
                  {a.trigger?.type ?? "—"}
                </span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {a.dmlogs.length} conversations
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
