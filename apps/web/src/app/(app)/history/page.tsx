import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export default async function HistoryPage() {
  // берем userId из сессии (без падений типов в CI)
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">History</h1>
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  const jobs = await prisma.analysisJob.findMany({
    where: { userId },
    include: { plan: true }, // связь называется "plan" (а не tradePlan)
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (jobs.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">History</h1>
        <p>No analyses yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">History</h1>
      <ul className="space-y-3">
        {jobs.map((j) => {
          const tps = (j.plan?.takeProfits ?? []) as unknown as number[];
          return (
            <li key={j.id} className="rounded border p-3">
              <div className="text-xs opacity-70">
                {new Date(j.createdAt).toLocaleString()}
              </div>
              {j.plan ? (
                <div className="text-sm leading-6">
                  <div>
                    Direction: <b>{j.plan.direction}</b>
                  </div>
                  <div>
                    Entry: {j.plan.entryLow} – {j.plan.entryHigh}
                  </div>
                  <div>SL: {j.plan.stop}</div>
                  <div>TP: {tps.join(", ")}</div>
                  <div>Confidence: {j.plan.confidence}</div>
                </div>
              ) : (
                <div className="text-sm italic">No plan</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
