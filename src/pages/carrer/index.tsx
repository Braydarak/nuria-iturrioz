import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import TrophyMuseum from "../../components/trophyMuseum";
import Recognitions from "../../components/recognitions";
import Animation, { AnimateOnScroll } from "../../components/animation";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";
import CareerTimeline from "../../components/careerTimeline";
import portrait from "../../assets/nuria/web/Nuria10.webp";

type YouTubePlayer = {
  isMuted: () => boolean;
  unMute: () => void;
  mute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo?: () => void;
  getCurrentTime?: () => number;
  destroy?: () => void;
};

type YTGlobal = {
  Player: new (element: HTMLElement, opts: unknown) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YTGlobal;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

const YOUTUBE_VIDEO_ID = "Pe4axkY5Has";

const videoButtonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm hover:bg-black/80";

export default function CareerPage() {
  const { t } = useTranslation();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const title = `${t("career.title")} – Nuria Iturrioz`;
  const description =
    "Trayectoria y biografía deportiva de Nuria Iturrioz: hitos, títulos y momentos clave de su carrera.";
  const url = `${SITE_URL}/carrer`;

  useEffect(() => {
    const host = playerHostRef.current;
    // En el prerender no se crea: el HTML estático no debe llevar el iframe
    if (!host || navigator.webdriver) return;

    // YouTube reemplaza el elemento por su iframe: se le da uno propio para
    // no tocar nodos que maneja React
    const mount = document.createElement("div");
    mount.className = "h-full w-full";
    host.appendChild(mount);
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(mount, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          origin: window.location.origin,
          enablejsapi: 1,
        },
        events: {
          // Los navegadores solo permiten autoplay sin sonido
          onReady: (event: { target: YouTubePlayer }) => {
            event.target.mute();
            setIsMuted(true);
            event.target.playVideo?.();
          },
        },
      });
    };

    // onYouTubeIframeAPIReady solo se dispara la primera vez que carga el
    // script: si se vuelve a la página sin recargar, la API ya está lista
    if (window.YT?.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "yt-iframe-api";
        document.body.appendChild(tag);
      }
    }

    return () => {
      cancelled = true;
      window.onYouTubeIframeAPIReady = null;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      host.replaceChildren();
    };
  }, []);

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (playerRef.current.isMuted()) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const restartVideo = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0, true);
    playerRef.current.playVideo?.();
  };

  const rewind10 = () => {
    if (!playerRef.current) return;
    const t = playerRef.current.getCurrentTime?.() || 0;
    playerRef.current.seekTo(Math.max(t - 10, 0), true);
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE_URL} />
        <meta property="og:site_name" content="Nuria Iturrioz" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE_URL} />
      </Helmet>

      <style>{`
        .golf-texture {
          background:
            radial-gradient(circle, #D9D9D9 1.8px, transparent 2px) 0 0/28px 28px,
            radial-gradient(circle, #D9D9D9 1.8px, transparent 2px) 14px 14px/28px 28px;
        }
        .texture-wedge {
          clip-path: polygon(0 0, 20% 0, 60% 100%, 0 100%);
        }
      `}</style>

      <main className="w-full bg-white pt-[68px] md:pt-[84px]">
        <Animation>
          {/* Apertura */}
          <section
            aria-labelledby="career-title"
            className="relative overflow-hidden"
          >
            <div className="texture-wedge golf-texture pointer-events-none absolute inset-y-0 left-0 w-[60vw] opacity-60" />
            <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
              <AnimateOnScroll y={24} x={0} scale={1}>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#2A579E]/70">
                  {t("career.eyebrow")}
                </p>
                <h1
                  id="career-title"
                  className="mt-3 font-signature text-5xl text-[#2A579E] sm:text-6xl md:text-7xl"
                >
                  {t("career.title")}
                </h1>
                <p className="mt-8 border-l-4 border-[#2A579E] pl-5 text-xl leading-relaxed text-gray-800 md:text-2xl">
                  {t("career.p1")}
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll
                y={0}
                x={40}
                scale={1}
                delay={0.1}
                className="relative mx-auto w-full max-w-sm"
              >
                <div className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl bg-[#2A579E]" />
                <img
                  src={portrait}
                  alt="Nuria Iturrioz"
                  decoding="async"
                  className="relative aspect-4/5 w-full rounded-3xl object-cover shadow-xl"
                  // Foto horizontal: se encuadra sobre la cara
                  style={{ objectPosition: "22% 30%" }}
                />
              </AnimateOnScroll>
            </div>
          </section>

          <CareerTimeline />

          {/* Vídeo */}
          <section
            aria-label="Video"
            className="relative overflow-hidden bg-linear-to-br from-[#1B3A75] via-[#2A579E] to-[#3C7BEA] py-20 md:py-28"
          >
            <div className="mx-auto max-w-6xl px-6">
              <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.35em] text-blue-100/80">
                {t("career.videoEyebrow")}
              </p>
              <AnimateOnScroll y={30} x={0} scale={0.97}>
                <div className="group relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
                  <div
                    id="yt-player"
                    ref={playerHostRef}
                    className="aspect-video w-full bg-black"
                  />

                  {/* En móvil siempre visibles (no hay hover) */}
                  <div className="absolute inset-0 flex items-end justify-end gap-2 p-3 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <button
                      onClick={rewind10}
                      aria-label={t("career.video.rewind")}
                      className={videoButtonClass}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5l-7 7 7 7" />
                        <path d="M19 5l-7 7 7 7" />
                      </svg>
                    </button>

                    <button
                      onClick={restartVideo}
                      aria-label={t("career.video.restart")}
                      className={videoButtonClass}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9" />
                        <path d="M3 3v6h6" />
                      </svg>
                    </button>

                    <button
                      onClick={toggleMute}
                      aria-label={
                        isMuted
                          ? t("career.video.unmute")
                          : t("career.video.mute")
                      }
                      className={videoButtonClass}
                    >
                      {isMuted ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 5l-6 4H3v6h2l6 4V5z" />
                          <path d="M19 9l-4 4m0-4l4 4" />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 5l-6 4H3v6h2l6 4V5z" />
                          <path d="M15 9a3 3 0 0 1 0 6" />
                          <path d="M17 7a6 6 0 0 1 0 10" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </section>
        </Animation>

        <TrophyMuseum />
        <Recognitions />
      </main>
    </>
  );
}
