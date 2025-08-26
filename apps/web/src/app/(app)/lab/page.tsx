"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Horizon = "long-term" | "scalp (1-2h)";

type AnalyzeResponse = {
  direction: "long" | "short";
  entry: [number, number];
  stop: number;
  takeProfits: number[];
  rr?: number;
  confidence?: number;
  reasoning?: string[] | string;
  timeframe?: string;
};

export default function LabPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("scalp (1-2h)");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function onAnalyze() {
    setError(null);
    setResult(null);

    if (!imageUrl.trim()) {
      setError("Please paste an image URL of the chart.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl.trim(), horizon }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Request failed with ${res.status}`);
      }

      const data: AnalyzeResponse = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>ChartLab</CardTitle>
          <CardDescription>
            Paste a chart screenshot URL, choose horizon, and get a structured
            trade plan from the AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chart image URL</label>
            <Input
              placeholder="https://example.com/my-tradingview-screenshot.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Horizon</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as Horizon)}
            >
              <option value="scalp (1-2h)">Scalp (1–2h)</option>
              <option value="long-term">Long-term</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onAnalyze} disabled={loading}>
              {loading ? "Analyzing…" : "Analyze"}
            </Button>
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Your provided chart image</CardDescription>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Chart preview"
              className="w-full rounded-md border object-contain"
            />
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>AI Trade Plan</CardTitle>
            <CardDescription>
              Structured output from the analysis endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Direction:</span>{" "}
              <span className="uppercase">{result.direction}</span>
            </div>
            <div>
              <span className="font-medium">Entry zone:</span>{" "}
              {result.entry[0]} – {result.entry[1]}
            </div>
            <div>
              <span className="font-medium">Stop-loss:</span> {result.stop}
            </div>
            <div>
              <span className="font-medium">Take profits:</span>{" "}
              {result.takeProfits.join(", ")}
            </div>
            {typeof result.rr === "number" && (
              <div>
                <span className="font-medium">R/R:</span> {result.rr}
              </div>
            )}
            {typeof result.confidence === "number" && (
              <div>
                <span className="font-medium">Confidence:</span>{" "}
                {(result.confidence * 100).toFixed(0)}%
              </div>
            )}
            {result.timeframe && (
              <div>
                <span className="font-medium">Timeframe:</span>{" "}
                {result.timeframe}
              </div>
            )}
            {result.reasoning && (
              <div className="pt-2">
                <span className="font-medium">Reasoning:</span>
                <ul className="list-disc pl-5">
                  {Array.isArray(result.reasoning) ? (
                    result.reasoning.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <li>{result.reasoning}</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
