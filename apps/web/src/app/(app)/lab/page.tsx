"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import CanvasOverlay from "@/components/canvas-overlay";
import { Badge } from "@/components/ui/badge";

export default function LabPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [horizon, setHorizon] = useState("long-term");
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Please enter an image URL.");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, horizon }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reason || "Analysis failed");
      }

      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResult = () => (
    <Card>
        <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>
                Direction: <Badge variant={analysis.direction === 'long' ? 'default' : 'destructive'}>{analysis.direction}</Badge>
            </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
                <div><strong>Entry:</strong> {analysis.entry.join(' - ')}</div>
                <div><strong>Stop:</strong> {analysis.stop}</div>
                <div><strong>Take Profits:</strong> {analysis.takeProfits.join(', ')}</div>
                <div><strong>Risk/Reward:</strong> {analysis.rr}</div>
                <div><strong>Confidence:</strong> {(analysis.confidence * 100).toFixed(0)}%</div>
                <div><strong>Timeframe:</strong> {analysis.timeframe}</div>
            </div>
            <div>
                <strong>Reasoning:</strong>
                <ul className="list-disc pl-5">
                    {analysis.reasoning.map((reason: string, index: number) => (
                        <li key={index}>{reason}</li>
                    ))}
                </ul>
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analysis Lab</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Analyze Chart from URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" type="url" placeholder="https://example.com/chart.png" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horizon">Horizon</Label>
                  <Select id="horizon" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                    <option value="long-term">Long-term</option>
                    <option value="scalp (1-2h)">Scalp (1-2h)</option>
                  </Select>
                </div>
                <Button type="submit" disabled={loading || !imageUrl}>
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Chart & Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Chart preview" className="w-full h-auto rounded-md" />
                        ) : (
                            <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
                                <p>Image preview will appear here</p>
                            </div>
                        )}
                        {analysis && <CanvasOverlay analysis={analysis} />}
                    </div>

                    {loading && <p className="mt-4">Analyzing, please wait...</p>}
                    {error && <p className="mt-4 text-red-500">{error}</p>}
                    {analysis && <div className="mt-4">{renderAnalysisResult()}</div>}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
