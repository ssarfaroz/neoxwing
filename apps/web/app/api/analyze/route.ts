import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const AnalyzeRequestSchema = z.object({
  imageUrl: z.string().url().or(z.string().min(1)), // временно принимаем любую строку
  horizon: z.enum(["long-term", "scalp (1-2h)"]),
});

const demoResponse = {
  direction: "long",
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


  // 2) Валидация входа
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const { imageUrl, horizon } = parsed.data;

  // 3) Создание Job + TradePlan в соответствии со схемой
  try {
    await prisma.analysisJob.create({
      data: {
        userId,
        imageRef: imageUrl,
        status: "done",
        params: { imageUrl, horizon },
        plan: {
          create: {
            // TradePlan требует userId — подключаем того же пользователя
            user: { connect: { id: userId } },
            direction: demoResponse.direction,
            entryLow: demoResponse.entry[0],
            entryHigh: demoResponse.entry[1],
            stop: demoResponse.stop,
            takeProfits: demoResponse.takeProfits as Prisma.InputJsonValue,
            rr: demoResponse.rr,
            confidence: demoResponse.confidence,
            timeframe: demoResponse.timeframe,
            reasoning: demoResponse.reasoning as Prisma.InputJsonValue,
          },
        },
      },
    });

    // Возвращаем демо-план (фронт рисует оверлей)
    return NextResponse.json(demoResponse, { status: 200 });
  } catch (err) {
    console.error("Failed to create analysis job:", err);
    return NextResponse.json({ error: "Failed to create analysis job" }, { status: 500 });
  }
}
