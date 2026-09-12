"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function scrollToScene(top: number) {
  if (document.documentElement.classList.contains("lenis")) window.dispatchEvent(new CustomEvent("aphelion:scroll", { detail: top }));
  else window.scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

export function useSmoothScroll(reduced: boolean, modalOpen: boolean) {
  const instance = useRef<Lenis | null>(null);
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ autoRaf: true, lerp: .07, wheelMultiplier: .82, smoothWheel: true, syncTouch: false, anchors: true,
      prevent: node => !!node.closest('[role="dialog"]') });
    instance.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const onScene = (event: Event) => lenis.scrollTo((event as CustomEvent<number>).detail);
    window.addEventListener("aphelion:scroll", onScene);
    return () => { window.removeEventListener("aphelion:scroll", onScene); lenis.destroy(); instance.current = null; };
  }, [reduced]);
  useEffect(() => { if (modalOpen) instance.current?.stop(); else instance.current?.start(); }, [modalOpen, reduced]);
}
