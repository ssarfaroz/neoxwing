import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="container mx-auto flex flex-col items-center justify-center space-y-8 px-4 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            ChartLab
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Analyze your trading charts with the power of AI. Upload an image, get an analysis, and improve your trading strategy.
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </div>
  );
}
