"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import CanvasOverlay from "@/components/canvas-overlay";

export default function LabPage() {
  const [image, setImage] = useState<string | null>(null);
  const [horizon, setHorizon] = useState("long-term");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 4 * 1024 * 1024) {
        alert("File size should be less than 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: image, horizon }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error(error);
      alert("An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analysis Lab</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Upload Chart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image (PNG/JPG, max 4MB)</Label>
                  <Input id="image" type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horizon">Horizon</Label>
                  <Select id="horizon" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                    <option value="long-term">Long-term</option>
                    <option value="scalp (1-2h)">Scalp (1-2h)</option>
                  </Select>
                </div>
                <Button type="submit" disabled={loading || !image}>
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              {image && (
                <div className="relative">
                  <img src={image} alt="Chart preview" className="w-full h-auto" />
                  {analysis && <CanvasOverlay analysis={analysis} />}
                </div>
              )}
              {analysis && (
                <div className="mt-4">
                  <pre>{JSON.stringify(analysis, null, 2)}</pre>
                </div>
              )}
              {loading && <p>Loading...</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
