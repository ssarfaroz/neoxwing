"use client";

import { useEffect, useRef } from "react";

interface CanvasOverlayProps {
  analysis: {
    entry: [number, number];
    stop: number;
    takeProfits: number[];
  };
}

const CanvasOverlay = ({ analysis }: CanvasOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { entry, stop, takeProfits } = analysis;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    const entryY1 = height * 0.4;
    const entryY2 = height * 0.5;
    ctx.fillRect(0, entryY1, width, entryY2 - entryY1);
    ctx.strokeStyle = "green";
    ctx.strokeRect(0, entryY1, width, entryY2 - entryY1);
    ctx.fillStyle = "green";
    ctx.fillText(`Entry: ${entry[0]}-${entry[1]}`, 5, entryY1 + 15);

    ctx.strokeStyle = "red";
    ctx.beginPath();
    const stopY = height * 0.6;
    ctx.moveTo(0, stopY);
    ctx.lineTo(width, stopY);
    ctx.stroke();
    ctx.fillStyle = "red";
    ctx.fillText(`SL: ${stop}`, 5, stopY - 5);

    ctx.strokeStyle = "blue";
    const tpY1 = height * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, tpY1);
    ctx.lineTo(width, tpY1);
    ctx.stroke();
    ctx.fillStyle = "blue";
    ctx.fillText(`TP1: ${takeProfits[0]}`, 5, tpY1 - 5);

    if (takeProfits[1]) {
      const tpY2 = height * 0.2;
      ctx.beginPath();
      ctx.moveTo(0, tpY2);
      ctx.lineTo(width, tpY2);
      ctx.stroke();
      ctx.fillText(`TP2: ${takeProfits[1]}`, 5, tpY2 - 5);
    }

  }, [analysis]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={300}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};

export default CanvasOverlay;
