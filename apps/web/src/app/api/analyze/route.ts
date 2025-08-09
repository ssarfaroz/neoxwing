import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { analyzeChart } from "@/lib/qwen";

const AnalyzeRequestSchema = z.object({
  imageUrl: z.string(),
  horizon: z.enum(["long-term", "scalp (1-2h)"]),
});

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
    const analysisResult = await analyzeChart(imageUrl, horizon);

    if (analysisResult.confidence < 0.8) {
      return NextResponse.json(
        {
          error: "Analysis confidence too low.",
          reason: `The model's confidence of ${analysisResult.confidence} is below the threshold of 0.8.`,
        },
        { status: 400 }
      );
    }

    const job = await prisma.analysisJob.create({
      data: {
        userId,
        imageRef: imageUrl,
        horizon,
        status: "COMPLETED",
        params: { imageUrl, horizon },
        tradePlan: {
          create: {
            direction: analysisResult.direction,
            entryLow: analysisResult.entry[0],
            entryHigh: analysisResult.entry[1],
            stopLoss: analysisResult.stop,
            takeProfit1: analysisResult.takeProfits[0],
            takeProfit2: analysisResult.takeProfits[1],
            rr: analysisResult.rr,
            confidence: analysisResult.confidence,
            reasoning: Array.isArray(analysisResult.reasoning) ? analysisResult.reasoning.join(', ') : analysisResult.reasoning,
            timeframe: analysisResult.timeframe,
          },
        },
      },
    });

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Analysis process failed:", error);
    return NextResponse.json({ error: "Failed to analyze chart." }, { status: 500 });
  }
}
