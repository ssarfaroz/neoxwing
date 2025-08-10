import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  // безопасно достаём userId (без падений типов в CI)
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return <p>You must be logged in to view this page.</p>;
  }

  const jobs = await prisma.analysisJob.findMany({
    where: { userId },
    include: { plan: true }, // связь называется "plan", не "tradePlan"
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Horizon</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const params = (job.params ?? {}) as Record<string, unknown>;
                const horizon =
                  typeof params.horizon === "string" ? params.horizon : "—";
                const direction = job.plan?.direction ?? "N/A";

                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      {new Date(job.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{horizon}</TableCell>
                    <TableCell>{direction}</TableCell>
                    <TableCell>{job.status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
