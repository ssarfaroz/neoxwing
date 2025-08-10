import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Prisma } from "@prisma/client";

const AnalyzeRequestSchema = z.object({
  imageUrl: z.string().url().min(1),
  horizon: z.enum(["long-term", "scalp (1-2h)"]),
});

const demoResponse = {
  direction: "long" as const,
  entry: [100, 105] as [number, number],
  stop: 95,
  takeProfits: [112, 118],
  rr: 2.1,
  confidence: 0.84,
  reasoning: ["demo output"],
  timeframe: "1h",
};

export async function POST(req: NextRequest) {
  // 1) Авторизация
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Разбор и валидация запроса
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const { imageUrl, horizon } = parsed.data;

  // 3) Сохранение результата (AnalysisJob + связанный TradePlan через поле "plan")
  try {
    await prisma.analysisJob.create({
      data: {
        userId,
        imageRef: imageUrl,
        status: "done", // как в Prisma-схеме
        params: { imageUrl, horizon }, // horizon хранится в JSON-поле params
        plan: {
          create: {
            user: { connect: { id: userId } }, // TradePlan требует userId
            direction: demoResponse.direction,
            entryLow: demoResponse.entry[0],
            entryHigh: demoResponse.entry[1],
            stop: demoResponse.stop,
            takeProfits: demoResponse.takeProfits as unknown as Prisma.InputJsonValue,
            rr: demoResponse.rr,
            confidence: demoResponse.confidence,
            timeframe: demoResponse.timeframe,
            reasoning: demoResponse.reasoning as unknown as Prisma.InputJsonValue,
          },
        },
      },
    });

    return NextResponse.json(demoResponse, { status: 200 });
  } catch (err) {
    console.error("Failed to create analysis job:", err);
    return NextResponse.json({ error: "Failed to create analysis job" }, { status: 500 });
  }
}
