"use client";

import { useEffect, useRef } from "react";

/** A live particle orbit. Stops offscreen, in background tabs, and for reduced motion. */
export function LightRing({ reduced }: { reduced: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const ctx = node.getContext("2d");
    if (!ctx) return;
    let frame = 0, visible = true, width = 1, height = 1, phase = 0;
    const particles = Array.from({ length: 1000 }, (_, i) => ({
      angle: i * 2.399963, radius: .83 + ((i * 73) % 191) / 800,
      size: .35 + ((i * 31) % 17) / 15,
    }));
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width * .68, height * .58);
      ctx.rotate(-.36 + Math.sin(phase * .25) * .045);
      const radius = Math.max(width * .5, height * .44);
      ctx.globalCompositeOperation = "screen";
      for (let band = 0; band < 3; band++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * (1 + band * .024), radius * (.26 + band * .009), 0, 0, Math.PI * 2);
        ctx.strokeStyle = ["#00b8ff", "#e4f9ff", "#ff5b16"][band];
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 22;
        ctx.lineWidth = band === 1 ? 1.8 : 1;
        ctx.globalAlpha = .65;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      particles.forEach((p, i) => {
        const a = p.angle + phase * (i % 2 ? 1 : .65);
        const x = Math.cos(a) * radius * p.radius;
        const y = Math.sin(a) * radius * .28 * p.radius;
        ctx.globalAlpha = .25 + (Math.sin(a) + 1) * .3;
        ctx.fillStyle = i % 5 === 0 ? "#ff6c25" : i % 3 === 0 ? "#3ac8ff" : "#e2f6ff";
        ctx.fillRect(x, y, p.size, p.size);
      });
      ctx.restore();
    }
    let last = 0;
    function tick(time: number) {
      if (time - last > 32) { phase += Math.min((time - last) / 1000, .05) * .045; last = time; draw(); }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      draw();
      if (!reduced && visible && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(tick); }
    }
    const resize = new ResizeObserver(() => {
      const rect = node!.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      node!.width = Math.round(width * dpr); node!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0); sync();
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    resize.observe(node); observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [reduced]);
  return <canvas ref={canvas} className="light-ring" aria-hidden="true" />;
}
