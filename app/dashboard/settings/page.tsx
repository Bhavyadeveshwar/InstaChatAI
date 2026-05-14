import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  const subscription = await db.subscription.findUnique({
    where: { userId: userId! },
  });

  return (
    <div className="animate-fadeIn max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">
        Manage your account and subscription.
      </p>

      {/* Profile */}
      <div className="glass rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
          <div>
            <p className="font-medium">{user?.fullName ?? "—"}</p>
            <p className="text-sm text-[var(--text-muted)]">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
          Subscription
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">
              {subscription?.plan ?? "FREE"} Plan
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {subscription?.plan === "PRO"
                ? "Unlimited automations & Smart AI"
                : "Up to 3 automations. Upgrade for Smart AI."}
            </p>
          </div>
          {subscription?.plan !== "PRO" && (
            <button className="btn-brand px-5 py-2 rounded-xl text-sm font-medium text-white">
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
