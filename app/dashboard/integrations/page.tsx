import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import ConnectInstagram from "@/components/dashboard/ConnectInstagram";

export default async function IntegrationsPage() {
  const { userId } = await auth();

  const igAccount = await db.instagramAccount.findUnique({
    where: { userId: userId! },
  });

  return (
    <div className="animate-fadeIn max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Integrations</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">
        Connect your Instagram account to enable automations.
      </p>

      <ConnectInstagram account={igAccount} />
    </div>
  );
}
