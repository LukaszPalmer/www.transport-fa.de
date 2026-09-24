"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { VideoSource } from "@/types/content";

interface HeroMediaProps {
  /** Server-gerendertes Poster (next/image) – sofort sichtbar, LCP-sicher. */
  poster: ReactNode;
  /** Overlays über Bild/Video (Gradient, Textur). */
  overlay: ReactNode;
  desktopSources: VideoSource[];
  mobileSources: VideoSource[];
}

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Hintergrund-Video nur bei ausreichender Verbindung und ohne Bewegungs-Präferenz. */
function shouldAutoplay(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return false;
  return !/(^|-)2g$|^3g$/.test(connection?.effectiveType ?? "");
}

/**
 * Hero-Hintergrund mit progressivem Video-Loading:
 * 1. SSR: Poster-Bild → sofortiger Paint, kein CLS (absolute, inset-0).
 * 2. Nach dem First Paint (requestIdleCallback) wird das <video> montiert –
 *    es konkurriert nie mit kritischen Ressourcen um Bandbreite.
 * 3. Weicher Crossfade, sobald das Video tatsächlich abspielt.
 * 4. Pausiert automatisch außerhalb des Viewports (spart CPU/Akku).
 * 5. Pause-Button erfüllt WCAG 2.2.2 (bewegte Inhalte > 5 s stoppbar).
 */
export function HeroMedia({ poster, overlay, desktopSources, mobileSources }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sources, setSources] = useState<VideoSource[] | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  // Schritt 2: Video erst im Idle-Zeitfenster nach dem Laden montieren.
  useEffect(() => {
    if (!shouldAutoplay()) return;

    const mount = () =>
      setSources(window.matchMedia("(min-width: 768px)").matches ? desktopSources : mobileSources);

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(mount, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(mount, 1200);
    return () => clearTimeout(id);
  }, [desktopSources, mobileSources]);

  // Schritt 4: Nur abspielen, solange der Hero sichtbar ist.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || userPaused) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => setIsPlaying(false));
        else video.pause();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [sources, userPaused]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) {
      // Video wurde (reduced motion / Save-Data) nicht automatisch geladen:
      // Nutzer entscheidet sich aktiv für die Wiedergabe.
      setSources(window.matchMedia("(min-width: 768px)").matches ? desktopSources : mobileSources);
      return;
    }
    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => setIsPlaying(false));
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  const label = isPlaying ? "Hintergrundvideo pausieren" : "Hintergrundvideo abspielen";

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        {poster}
        {sources && (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-out"
            style={{ opacity: hasStarted ? 1 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            onPlaying={() => {
              setHasStarted(true);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
          >
            {sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        )}
        {overlay}
      </div>

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={label}
        title={label}
        className="glass absolute right-4 bottom-28 z-10 inline-flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white sm:right-6 md:bottom-36 lg:right-8"
      >
        {isPlaying ? (
          <Pause aria-hidden="true" className="size-4" />
        ) : (
          <Play aria-hidden="true" className="size-4 translate-x-px" />
        )}
      </button>
    </>
  );
}
