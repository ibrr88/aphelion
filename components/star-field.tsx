"use client";
import { useEffect, useRef } from "react";

export function StarField({ reduced }: { reduced: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    const ctx = node?.getContext("2d");
    if (!node || !ctx) return;
    let width = 1, height = 1, raf = 0, visible = false;
    let targetTravel = 0, smoothTravel = 0, previous = performance.now();
    let seed = 71;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const stars = Array.from({ length: 110 }, (_, i) => ({
      x: random(), y: random(), r: .35 + random() * .6,
      alpha: .2 + random() * .55, phase: random() * Math.PI * 2,
      period: 11 + random() * 12, twinkle: i % 11 === 0, depth: .026 + random() * .034,
    }));
    function draw(time = 0, travel = smoothTravel) {
      if (!ctx || !node) return;
      ctx.clearRect(0, 0, width, height);
      const count = width < 600 ? 44 : 110;
      for (const star of stars.slice(0, count)) {
        const x = ((star.x * width - (reduced ? 0 : travel * star.depth)) % width + width) % width;
        const shimmer = star.twinkle && !reduced ? 1 + .12 * Math.sin(time / 1000 * Math.PI * 2 / star.period + star.phase) : 1;
        ctx.globalAlpha = Math.min(1, star.alpha * shimmer);
        ctx.fillStyle = "#e2eef6";
        ctx.beginPath(); ctx.arc(x, star.y * height, star.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    function measure() { targetTravel = Math.max(0, -node!.closest("section")!.getBoundingClientRect().top); }
    function tick(time: number) {
      measure();
      const elapsed = Math.min(64, time - previous); previous = time;
      smoothTravel += (targetTravel - smoothTravel) * (1 - Math.exp(-elapsed / 75));
      if (Math.abs(targetTravel - smoothTravel) < .05) smoothTravel = targetTravel;
      draw(time);
      raf = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(raf);
      measure(); previous = performance.now();
      if (reduced) { smoothTravel = targetTravel; draw(0); }
      else if (visible && !document.hidden) raf = requestAnimationFrame(tick);
      else draw(0);
    }
    const resize = new ResizeObserver(() => {
      const rect = node.getBoundingClientRect(); width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      node.width = Math.round(width * dpr); node.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); sync();
    });
    const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    resize.observe(node); observer.observe(node); document.addEventListener("visibilitychange", sync);
    return () => { cancelAnimationFrame(raf); resize.disconnect(); observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [reduced]);
  return <canvas ref={canvas} className="star-field" aria-hidden="true" />;
}
