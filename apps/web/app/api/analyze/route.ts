import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const AnalyzeRequestSchema = z.object({
  imageUrl: z.string(),
  horizon: z.enum(["long-term", "scalp (1-2h)"]),
});

const demoResponse = {
  direction: "long",
  entry: [100, 105],
  stop: 95,
  takeProfits: [112, 118],
  rr: 2.1,
  confidence: 0.84,
  reasoning: ["demo output"],
  timeframe: "1h",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let reqBody;
  try {
    reqBody = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validation = AnalyzeRequestSchema.safeParse(reqBody);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.format() }, { status: 400 });
  }

  const { imageUrl, horizon } = validation.data;

  try {
    const job = await prisma.analysisJob.create({
      data: {
        userId,
        imageRef: imageUrl,
        horizon,
        status: "COMPLETED",
        params: { imageUrl, horizon },
        tradePlan: {
          create: {
            direction: demoResponse.direction,
            entryLow: demoResponse.entry[0],
            entryHigh: demoResponse.entry[1],
            stopLoss: demoResponse.stop,
            takeProfit1: demoResponse.takeProfits[0],
            takeProfit2: demoResponse.takeProfits[1],
            rr: demoResponse.rr,
            confidence: demoResponse.confidence,
            reasoning: demoResponse.reasoning.join(', '),
            timeframe: demoResponse.timeframe,
          },
        },
      },
    });

    return NextResponse.json(demoResponse);
  } catch (error) {
    console.error("Failed to create analysis job:", error);
    return NextResponse.json({ error: "Failed to create analysis job" }, { status: 500 });
  }
}
