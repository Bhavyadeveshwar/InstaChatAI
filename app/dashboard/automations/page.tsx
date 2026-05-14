import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Zap } from "lucide-react";
import AutomationCard from "@/components/dashboard/AutomationCard";

export default async function AutomationsPage() {
  const { userId } = await auth();

  const automations = await db.automation.findMany({
    where: { userId: userId! },
    include: { trigger: true, listener: true, _count: { select: { dmlogs: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {automations.length} automation{automations.length !== 1 ? "s" : ""}
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

      {automations.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Zap size={48} className="mx-auto mb-4 text-[var(--brand)] opacity-30" />
          <h3 className="font-semibold mb-2">No automations yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Create your first automation to start responding to comments and DMs automatically.
          </p>
          <Link
            href="/dashboard/automations/new"
            className="btn-brand px-6 py-2.5 rounded-xl text-sm font-medium text-white inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Create your first automation
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {automations.map((automation) => (
            <AutomationCard key={automation.id} automation={automation as any} />
          ))}
        </div>
      )}
    </div>
  );
}
