"use client";
import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useSceneMotion(root: RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const el = root.current;
    // All content starts visible. Effects are progressive enhancements and
    // GSAP's matchMedia reverts inline styles and triggers on preference changes.
    if (reduced) {
      const number = el.querySelector(".altitude-number");
      const label = el.querySelector(".altitude-label");
      if (number) number.textContent = "400";
      if (label) label.textContent = "A NEW PERSPECTIVE";
      return;
    }
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (window.scrollY < innerHeight * .5) {
        gsap.from(".headline-line", { y: 60, clipPath: "inset(100% 0 0 0)", opacity: 0, duration: 1.4, stagger: .16, ease: "power3.out", delay: .12 });
        gsap.from(".hero-reveal, .site-header", { y: 16, opacity: 0, duration: 1.05, stagger: .13, delay: .55, ease: "power2.out" });
      }
      const hero = gsap.timeline({ scrollTrigger: { trigger: ".hero-sequence", start: "top top", end: "bottom bottom", scrub: .55 } });
      hero.to(".hero-content", { y: -90, opacity: 0, duration: .42, ease: "none" }, 0)
        .fromTo(".hero-passage-caption", { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .38, ease: "none" }, .52)
        .to(".hero-coordinate", { opacity: .3, y: -25, duration: .6, ease: "none" }, .2)
        .to(".hero-progress>span", { scaleX: 1, duration: 1, ease: "none" }, 0);
      gsap.to(".perspective-copy span", { color: "#edf0ef", ease: "none", scrollTrigger: { trigger: ".intro", start: "top 60%", end: "bottom 70%", scrub: .8 } });
      gsap.utils.toArray<HTMLElement>(".intro-orbit").forEach((orbit, i) => {
        const turns = [420, -650, 920, -1260][i];
        gsap.to(orbit, { rotate: turns, ease: "power1.in", scrollTrigger: { trigger: ".intro", start: "top bottom", end: "bottom top", scrub: .55 + i * .13 } });
      });
      gsap.utils.toArray<HTMLElement>(".reveal").forEach(target => gsap.from(target, { y: 36, opacity: .25, duration: .9, ease: "power2.out", scrollTrigger: { trigger: target, start: "top 93%", once: true } }));
      gsap.utils.toArray<HTMLElement>(".experience-details>div, .footer-nav>div, .footer-statement").forEach(target => gsap.from(target, { y: 25, opacity: 0, duration: .85, ease: "power2.out", scrollTrigger: { trigger: target, start: "top 94%", once: true } }));
      gsap.from(".footer-signature", { y: 45, opacity: .3, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: ".site-footer", start: "top 85%", once: true } });
      gsap.from(".closing-line", { yPercent: 105, opacity: 0, duration: 1.15, stagger: .13, ease: "power3.out", scrollTrigger: { trigger: ".closing", start: "top 68%", once: true } });
      gsap.from(".closing-lead, .closing-cta", { y: 28, opacity: 0, duration: .9, stagger: .12, ease: "power2.out", scrollTrigger: { trigger: ".closing", start: "top 58%", once: true } });
      gsap.fromTo(".closing-cosmos", { scale: .62, opacity: .22 }, { scale: 1.08, opacity: .86, ease: "none", scrollTrigger: { trigger: ".closing", start: "top bottom", end: "bottom top", scrub: 1.15 } });
      gsap.to(".closing-cosmos>i:nth-child(1)", { rotate: 140, ease: "none", scrollTrigger: { trigger: ".closing", start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.to(".closing-cosmos>i:nth-child(2)", { rotate: -210, ease: "none", scrollTrigger: { trigger: ".closing", start: "top bottom", end: "bottom top", scrub: 1.2 } });
      gsap.to(".closing-cosmos>i:nth-child(3)", { rotate: 310, ease: "none", scrollTrigger: { trigger: ".closing", start: "top bottom", end: "bottom top", scrub: 1.4 } });
      gsap.to(".closing-scan", { rotate: 30, ease: "none", scrollTrigger: { trigger: ".closing", start: "top bottom", end: "bottom top", scrub: 1.3 } });
      const altitude = el.querySelector<HTMLElement>(".altitude-number");
      const label = el.querySelector<HTMLElement>(".altitude-label");
      if (altitude) altitude.textContent = "000";
      const chapters = gsap.utils.toArray<HTMLElement>(".ascent-chapters li");
      const timeline = gsap.timeline({ scrollTrigger: { trigger: ".ascent", start: "top top", end: "bottom bottom", scrub: .7,
        onUpdate: self => {
          if (altitude) altitude.textContent = Math.round(self.progress * 400).toString().padStart(3, "0");
          const stage = Math.min(2, Math.floor(self.progress * 3));
          if (label) label.textContent = ["THE FAMILIAR", "THE EDGE OF SPACE", "A NEW PERSPECTIVE"][stage];
          chapters.forEach((chapter, i) => chapter.classList.toggle("is-active", i === stage));
        },
      }});
      timeline.fromTo(".ascent-heading", { y: 30, opacity: .4 }, { y: -20, opacity: 1, ease: "none" }, 0)
        .fromTo(".ascent-track-fill", { scaleY: 0 }, { scaleY: 1, ease: "none" }, 0);
    }, el);
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; mm.revert(); };
  }, [root, reduced]);
}
