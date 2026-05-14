import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AutomationDetail from "@/components/dashboard/AutomationDetail";

export default async function AutomationPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  const automation = await db.automation.findFirst({
    where: { id: params.id, userId: userId! },
    include: {
      trigger: true,
      listener: true,
      posts: true,
      dmlogs: { orderBy: { updatedAt: "desc" }, take: 20 },
    },
  });

  if (!automation) notFound();

  return <AutomationDetail automation={automation as any} />;
}
