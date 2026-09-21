"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/journeys";

type Props = { name: "departure" | "observatory"; section: string; reduced: boolean; idle?: boolean; };

/**
 * Keep the poster visible until the browser has decoded a playable first frame.
 * Scroll-driven seeking begins only after that point, so opening the page never
 * asks the decoder to jump backwards and forwards while it is still loading.
 */
export function ScrollFilm({ name, section, reduced, idle = false }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const retries = useRef(0);
  const [near, setNear] = useState(idle);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const presentFrame = useCallback(() => {
    const node = video.current;
    const surface = canvas.current;
    if (!node || !surface || node.readyState < 2 || !node.videoWidth || !node.videoHeight) return false;
    // The decoded film can be larger than the screen. Painting every scroll
    // frame at its native 1440p size makes seeking unnecessarily expensive,
    // especially while the browser is also downloading the movie.
    const bounds = surface.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.min(node.videoWidth, Math.max(2, Math.round(bounds.width * pixelRatio)));
    const height = Math.min(node.videoHeight, Math.max(2, Math.round(bounds.height * pixelRatio)));
    if (surface.width !== width || surface.height !== height) {
      surface.width = width;
      surface.height = height;
    }
    const context = surface.getContext("2d", { alpha: false });
    if (!context) return false;
    context.imageSmoothingQuality = "high";
    // Canvas does not understand CSS object-fit. Scale and crop the decoded
    // frame explicitly so portrait mobile screens keep the film's proportions
    // instead of squeezing a 16:9 image into a tall canvas.
    const coverScale = Math.max(width / node.videoWidth, height / node.videoHeight);
    const renderWidth = node.videoWidth * coverScale;
    const renderHeight = node.videoHeight * coverScale;
    const offsetX = (width - renderWidth) * .66;
    const offsetY = (height - renderHeight) * .5;
    context.drawImage(node, offsetX, offsetY, renderWidth, renderHeight);
    surface.dataset.presentedTime = node.currentTime.toFixed(3);
    setReady(true);
    return true;
  }, []);
  useEffect(() => {
    const node = video.current;
    if (!node || !near || reduced) return;
    setFailed(false);
    let primed = false;
    const detach = () => {
      node.removeEventListener("loadeddata", prime);
      node.removeEventListener("canplay", prime);
    };
    const prime = () => {
      if (primed) return;
      if (!presentFrame()) return;
      primed = true;
      retries.current = 0;
      setFailed(false);
      // Initialization is complete. Later `canplay` events can occur between
      // seeks on a partially buffered film and must not repaint frame zero.
      detach();
    };
    // Cached media can finish before React hydrates and attaches JSX event
    // handlers. Inspect the decoder directly as well as listening for events.
    node.addEventListener("loadeddata", prime);
    node.addEventListener("canplay", prime);
    if (node.readyState >= 2) prime();
    else node.load();
    return detach;
  }, [near, reduced, presentFrame]);
  useEffect(() => {
    const node = video.current;
    const host = node?.closest(section);
    if (!node || !host || reduced) return;
    // Start fetching the later film well before its section arrives. Cloudflare
    // serves byte ranges correctly, but waiting until the section is only two
    // screens away leaves too little time for the larger observatory film.
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin: "4800px 0px" });
    observer.observe(host);
    // IntersectionObserver can be delayed during a long smooth-scroll scene.
    // The fallback makes the preload deterministic without competing with the
    // hero film during the first moments of page load.
    const warmup = window.setTimeout(() => setNear(true), idle ? 0 : 1800);
    return () => { observer.disconnect(); window.clearTimeout(warmup); };
  }, [section, reduced, idle]);
  useEffect(() => {
    const node = video.current;
    const host = node?.closest(section);
    if (!node || !host || !near || reduced || !ready) return;
    let measureRaf = 0, easingRaf = 0, commitRaf = 0;
    let desired = node.currentTime || 0, displayed = desired, previous = performance.now();
    let busy = false, disposed = false, seekWatchdog = 0;
    const responseTime = matchMedia("(pointer: coarse)").matches ? 75 : 125;
    const duration = () => Number.isFinite(node.duration) ? Math.max(0, node.duration - .05) : 0;
    function seek() {
      if (!node || busy || node.seeking || node.readyState < 2 || duration() === 0) return;
      // Keep only the latest requested frame. Queuing every intermediate seek
      // makes the film fall behind the page and can leave it stuck on frame 0.
      const next = Math.min(duration(), Math.max(0, Math.round(displayed * 24) / 24));
      if (Math.abs(node.currentTime - next) > .02) {
        busy = true;
        node.currentTime = next;
        // A suspended tab or a recovering decoder can occasionally lose a
        // `seeked` event. Never let one lost event freeze every later frame.
        window.clearTimeout(seekWatchdog);
        seekWatchdog = window.setTimeout(() => {
          if (disposed) return;
          busy = false;
          if (!node.seeking && node.readyState >= 2) presentFrame();
          seek();
        }, 900);
      } else {
        presentFrame();
      }
    }
    function commitFrame() {
      window.clearTimeout(seekWatchdog);
      cancelAnimationFrame(commitRaf);
      // `seeked` is reliable for paused media across Chromium, WebKit and
      // Firefox. Paint on the next display frame so the decoded image is ready.
      commitRaf = requestAnimationFrame(() => {
        if (disposed) return;
        presentFrame();
        if (canvas.current) canvas.current.dataset.presentedTime = node!.currentTime.toFixed(3);
        busy = false;
        // If the user continued scrolling while the decoder was busy, jump to
        // the newest requested frame rather than replaying stale seek targets.
        seek();
      });
    }
    function ease(time: number) {
      easingRaf = 0;
      if (disposed || document.hidden) return;
      const elapsed = Math.min(80, Math.max(0, time - previous));
      previous = time;
      displayed += (desired - displayed) * (1 - Math.exp(-elapsed / responseTime));
      if (Math.abs(desired - displayed) < .012) displayed = desired;
      seek();
      // Mouse wheels arrive in discrete steps. Continue easing briefly after
      // the final wheel event so the last movement settles like a trackpad.
      if (Math.abs(desired - displayed) >= .012) easingRaf = requestAnimationFrame(ease);
    }
    function scheduleEase() {
      if (easingRaf || disposed) return;
      previous = performance.now();
      easingRaf = requestAnimationFrame(ease);
    }
    function measure() {
      measureRaf = 0;
      if (!node || !host || document.hidden) return;
      const rect = host.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
      desired = progress * duration();
      scheduleEase();
    }
    function scheduleMeasure() {
      if (measureRaf || disposed) return;
      measureRaf = requestAnimationFrame(measure);
    }
    function visibilityChange() { if (!document.hidden) { scheduleMeasure(); scheduleEase(); } }
    node.addEventListener("seeked", commitFrame);
    node.addEventListener("canplay", scheduleMeasure);
    node.addEventListener("loadedmetadata", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    document.addEventListener("visibilitychange", visibilityChange);
    // Synchronize immediately. This covers refreshed hash links and sections
    // reached before IntersectionObserver callbacks have fired.
    scheduleMeasure();
    return () => {
      disposed = true;
      window.clearTimeout(seekWatchdog);
      cancelAnimationFrame(commitRaf);
      cancelAnimationFrame(measureRaf);
      cancelAnimationFrame(easingRaf);
      node.removeEventListener("seeked", commitFrame);
      node.removeEventListener("canplay", scheduleMeasure);
      node.removeEventListener("loadedmetadata", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      document.removeEventListener("visibilitychange", visibilityChange);
      node.pause();
    };
  }, [near, ready, reduced, section, presentFrame]);
  return <div className={"scroll-film" + (ready && !failed && !reduced ? " film-ready" : "")}>
    <img className="film-poster" src={asset(`/videos/${name}-poster.webp`)} alt="" width={1920} height={1080} fetchPriority={idle ? "high" : "auto"} />
    <canvas ref={canvas} className="film-video" aria-hidden="true" />
    <video ref={video} className="film-decoder" muted playsInline preload={near && !reduced ? "auto" : "none"} aria-hidden="true" tabIndex={-1}
      onError={(event) => {
        const node = video.current;
        // Ignore errors dispatched by an individual <source>. The browser may
        // still have selected and decoded the other responsive source.
        if (!node || event.target !== node || !node.error) return;
        if (node && near && !reduced && retries.current < 2) { retries.current += 1; window.setTimeout(() => node.load(), 250 * retries.current); }
        else setFailed(true);
      }}>
      {near && !reduced && <><source media="(max-width: 700px)" src={asset(`/videos/${name}-mobile.mp4`)} type="video/mp4" /><source src={asset(`/videos/${name}.mp4`)} type="video/mp4" /></>}
    </video>
  </div>;
}

