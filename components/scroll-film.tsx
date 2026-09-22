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
    if (!node) return;
    const root = document.documentElement;
    const filmKey = name === "departure" ? "filmDeparture" : "filmObservatory";
    const progressKey = filmKey + "Progress";
    const sourceUrl = asset(`/videos/${name}${matchMedia("(max-width: 700px)").matches ? "-mobile" : ""}.mp4`);
    let disposed = false, objectUrl = "", usingFallback = false, lastProgress = -1;
    const request = new AbortController();
    const announceProgress = (value: number) => {
      const progress = Math.max(0, Math.min(1, value));
      if (progress < 1 && progress - lastProgress < .01) return;
      lastProgress = progress;
      root.dataset[progressKey] = progress.toFixed(3);
      window.dispatchEvent(new CustomEvent("aphelion:film-progress", { detail: { name, progress } }));
    };
    const announceReady = () => {
      root.dataset[filmKey] = "ready";
      announceProgress(1);
      window.dispatchEvent(new CustomEvent("aphelion:film-ready", { detail: { name } }));
    };
    if (reduced) {
      announceReady();
      return;
    }
    const prime = () => {
      if (disposed || root.dataset[filmKey] === "ready") return;
      if (!presentFrame()) return;
      setFailed(false);
      announceReady();
    };
    const fallback = () => {
      if (disposed) return;
      if (!usingFallback) {
        usingFallback = true;
        node.src = sourceUrl;
        node.preload = "auto";
        node.load();
      } else {
        setFailed(true);
        // Never trap the visitor behind the loader when media playback is not
        // supported. The poster remains as a graceful fallback.
        announceReady();
      }
    };
    node.addEventListener("loadeddata", prime);
    node.addEventListener("canplay", prime);
    node.addEventListener("error", fallback);
    async function loadFilm() {
      announceProgress(.02);
      try {
        const response = await fetch(sourceUrl, { cache: "force-cache", signal: request.signal });
        if (!response.ok) throw new Error(`Film request failed: ${response.status}`);
        const total = Number(response.headers.get("content-length")) || 0;
        const reader = response.body?.getReader();
        let blob: Blob;
        if (reader && total) {
          const chunks: BlobPart[] = [];
          let loaded = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              const copy = value.slice().buffer as ArrayBuffer;
              chunks.push(copy); loaded += value.byteLength; announceProgress(.02 + .93 * loaded / total);
            }
          }
          blob = new Blob(chunks, { type: response.headers.get("content-type") || "video/mp4" });
        } else {
          blob = await response.blob();
          announceProgress(.95);
        }
        if (disposed) return;
        objectUrl = URL.createObjectURL(blob);
        node!.src = objectUrl;
        node!.preload = "auto";
        node!.load();
      } catch (error) {
        if (!request.signal.aborted) fallback();
      }
    }
    void loadFilm();
    return () => {
      disposed = true;
      request.abort();
      node.removeEventListener("loadeddata", prime);
      node.removeEventListener("canplay", prime);
      node.removeEventListener("error", fallback);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [name, reduced, presentFrame]);
  useEffect(() => {
    const node = video.current;
    const host = node?.closest(section);
    if (!node || !host || reduced || !ready) return;
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
  }, [ready, reduced, section, presentFrame]);
  return <div className={"scroll-film" + (ready && !failed && !reduced ? " film-ready" : "")}>
    <img className="film-poster" src={asset(`/videos/${name}-poster.webp`)} alt="" width={1920} height={1080} fetchPriority={idle ? "high" : "auto"} />
    <canvas ref={canvas} className="film-video" aria-hidden="true" />
    <video ref={video} className="film-decoder" muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
  </div>;
}

