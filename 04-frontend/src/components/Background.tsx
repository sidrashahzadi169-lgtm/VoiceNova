"use client";

import React, { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let phase = 0;
    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const centerY = h * 0.75;

      phase += 0.005;

      ctx.save();
      ctx.lineWidth = 1;

      const waves = [
        { amp: 80, freq: 0.0008, color: "rgba(108, 99, 255, 0.015)", delay: 0 },
        { amp: 120, freq: 0.0005, color: "rgba(0, 194, 255, 0.012)", delay: Math.PI / 3 },
        { amp: 60, freq: 0.0012, color: "rgba(255, 255, 255, 0.005)", delay: Math.PI * (2 / 3) },
      ];

      waves.forEach((wave) => {
        ctx.strokeStyle = wave.color;
        ctx.beginPath();
        ctx.moveTo(0, centerY);

        for (let x = 0; x < w; x++) {
          const y = centerY + Math.sin(x * wave.freq + phase + wave.delay) * wave.amp;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="bg-waveform-canvas" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-3" />
    </>
  );
}
