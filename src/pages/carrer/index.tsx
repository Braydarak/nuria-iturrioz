import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import Trophies from "../../components/trophies";
import Recognitions from "../../components/recognitions";
import Footer from "../../components/footer";
import ScrollAnimation, {
  ScrollReveal,
} from "../../components/scrollAnimation";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";

type YouTubePlayer = {
  isMuted: () => boolean;
  unMute: () => void;
  mute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo?: () => void;
  getCurrentTime?: () => number;
};

type YTGlobal = {
  Player: new (id: string, opts: unknown) => YouTubePlayer;
};

declare global {
  interface Window {
    YT: YTGlobal;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

export default function CareerPage() {
  const { t } = useTranslation();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const isSectionAnimatingRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const title = `${t("career.title")} – Nuria Iturrioz`;
  const description =
    "Trayectoria y biografía deportiva de Nuria Iturrioz: hitos, títulos y momentos clave de su carrera.";
  const url = `${SITE_URL}/carrer`;

  useEffect(() => {
    const loadScript = () => {
      if (document.getElementById("yt-iframe-api")) return;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.id = "yt-iframe-api";
      document.body.appendChild(tag);
    };
    loadScript();

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: "Pe4axkY5Has",
        playerVars: {
          autoplay: 1,
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
          onReady: () => {
            playerRef.current?.mute();
            setIsMuted(true);
            playerRef.current?.playVideo?.();
          },
        },
      });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  useEffect(() => {
    const wrapper = document.getElementById("career-scroll-wrapper");
    wrapper?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const wrapper = document.getElementById("career-scroll-wrapper");
    const content = document.getElementById("career-scroll-content");
    if (!wrapper || !content) return;

    const getSections = () =>
      Array.from(
        content.querySelectorAll("[data-career-section]"),
      ) as HTMLElement[];

    const getClosestSectionIndex = (sections: HTMLElement[]) => {
      const current = wrapper.scrollTop;
      let bestIndex = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < sections.length; i += 1) {
        const dist = Math.abs(sections[i].offsetTop - current);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      }

      return bestIndex;
    };

    const canTransition = (
      sections: HTMLElement[],
      index: number,
      direction: 1 | -1,
    ) => {
      const section = sections[index];
      if (!section) return false;

      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const viewBottom = wrapper.scrollTop + wrapper.clientHeight;
      const epsilon = 2;

      if (direction === 1) return viewBottom >= bottom - epsilon;
      return wrapper.scrollTop <= top + epsilon;
    };

    const easing = (t: number) => 1 - Math.pow(1 - t, 4);

    const goToSection = (sections: HTMLElement[], targetIndex: number) => {
      const clamped = Math.max(0, Math.min(targetIndex, sections.length - 1));
      const targetTop = sections[clamped].offsetTop;

      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(targetTop, {
          duration: 1.25,
          easing,
          lock: true,
          onComplete: () => {
            isSectionAnimatingRef.current = false;
          },
        });
        return;
      }

      wrapper.scrollTo({ top: targetTop, left: 0, behavior: "smooth" });
      window.setTimeout(() => {
        isSectionAnimatingRef.current = false;
      }, 1300);
    };

    const onWheel = (e: WheelEvent) => {
      const sections = getSections();
      if (sections.length <= 1) return;
      if (isSectionAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      if (Math.abs(e.deltaY) < 6) return;
      const direction = (e.deltaY > 0 ? 1 : -1) as 1 | -1;
      const currentIndex = getClosestSectionIndex(sections);

      if (!canTransition(sections, currentIndex, direction)) return;

      e.preventDefault();
      isSectionAnimatingRef.current = true;
      goToSection(sections, currentIndex + direction);
    };

    let touchStartY: number | null = null;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const startY = touchStartY;
      touchStartY = null;
      if (startY == null) return;

      const endY = e.changedTouches[0]?.clientY ?? startY;
      const delta = startY - endY;
      if (Math.abs(delta) < 40) return;

      const sections = getSections();
      if (sections.length <= 1) return;
      if (isSectionAnimatingRef.current) return;

      const direction = (delta > 0 ? 1 : -1) as 1 | -1;
      const currentIndex = getClosestSectionIndex(sections);
      if (!canTransition(sections, currentIndex, direction)) return;

      isSectionAnimatingRef.current = true;
      goToSection(sections, currentIndex + direction);
    };

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    wrapper.addEventListener("touchstart", onTouchStart, { passive: true });
    wrapper.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      wrapper.removeEventListener("wheel", onWheel);
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchend", onTouchEnd);
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
      <ScrollAnimation
        lenisWrapperSelector="#career-scroll-wrapper"
        lenisContentSelector="#career-scroll-content"
        lenisOptions={{ lerp: 0.05, wheelMultiplier: 0.85 }}
        onLenis={(lenis) => {
          lenisRef.current = lenis;
        }}
      >
        <main className="relative w-full min-h-svh overflow-hidden">
          <style>{`
            .golf-texture {
              background:
                radial-gradient(circle, #D9D9D9 1.8px, transparent 2px) 0 0/28px 28px,
                radial-gradient(circle, #D9D9D9 1.8px, transparent 2px) 14px 14px/28px 28px;
            }
            .texture-wedge {
              position: absolute;
              top: 0; bottom: 0; left: 0;
              width: 60vw;
              /* Cuña diagonal desde el costado izquierdo hacia el centro */
              clip-path: polygon(0 0, 20% 0, 60% 100%, 0 100%);
            }
          `}</style>

          <div className="texture-wedge golf-texture opacity-60 pointer-events-none" />

          <div
            id="career-scroll-wrapper"
            className="relative z-10 w-full overflow-y-auto"
            style={{
              height: "calc(100svh - 6.5rem)",
              marginTop: "6.5rem",
              overscrollBehaviorY: "contain",
            }}
          >
            <div id="career-scroll-content" className="w-full">
              <section
                data-career-section
                aria-labelledby="career-title"
                className="w-full flex items-center justify-center"
                style={{
                  minHeight: "calc(100svh - 6.5rem)",
                }}
              >
                <div className="w-full max-w-7xl mx-auto px-4">
                  <ScrollReveal
                    className="w-full"
                    y={16}
                    scale={0.975}
                    duration={1.05}
                  >
                    <h1
                      id="career-title"
                      className="font-signature text-4xl md:text-5xl text-[#2A579E] mb-10 tracking-tight text-center"
                    >
                      {t("career.title")}
                    </h1>
                  </ScrollReveal>

                  <ScrollReveal
                    className="w-full"
                    delay={0.05}
                    y={18}
                    scale={0.975}
                    duration={1.05}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 text-lg md:text-xl leading-relaxed text-black/90 text-justify">
                      <div className="space-y-6">
                        <p>{t("career.p1")}</p>
                        <p>{t("career.p2")}</p>
                        <p>{t("career.p3")}</p>
                      </div>
                      <div className="space-y-6">
                        <p>{t("career.p4")}</p>
                        <p>{t("career.p5")}</p>
                        <p>{t("career.p6")}</p>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal
                    className="w-full"
                    delay={0.1}
                    y={14}
                    scale={0.98}
                    duration={1.0}
                  >
                    <p className="mt-10 text-center font-signature text-2xl md:text-3xl text-[#2A579E] font-medium">
                      {t("career.p7")}
                    </p>
                  </ScrollReveal>
                </div>
              </section>

              <section
                data-career-section
                aria-label="Video"
                className="w-full flex items-center justify-center"
                style={{
                  minHeight: "calc(100svh - 6.5rem)",
                }}
              >
                <div className="w-full max-w-7xl mx-auto px-4">
                  <ScrollReveal
                    className="w-full"
                    y={18}
                    scale={0.97}
                    duration={1.05}
                  >
                    <div className="mt-8">
                      <div className="relative group rounded-xl overflow-hidden shadow-md">
                        <div
                          id="yt-player"
                          className="w-full aspect-video bg-black"
                        />

                        <div className="absolute inset-0 flex items-end justify-end gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={rewind10}
                            aria-label="Retroceder 10s"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm border border-white/20"
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
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm border border-white/20"
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
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm border border-white/20"
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
                    </div>
                  </ScrollReveal>
                </div>
              </section>

              <section
                data-career-section
                aria-label="Trofeos"
                className="w-full"
                style={{
                  minHeight: "calc(100svh - 6.5rem)",
                }}
              >
                <div className="w-full">
                  <ScrollReveal
                    className="w-full"
                    delay={0.05}
                    y={14}
                    scale={0.985}
                    duration={1.0}
                  >
                    <Trophies variant="career" />
                  </ScrollReveal>
                </div>
              </section>

              <section
                data-career-section
                aria-label="Reconocimientos"
                className="w-full"
                style={{
                  minHeight: "calc(100svh - 6.5rem)",
                }}
              >
                <div className="w-full">
                  <ScrollReveal
                    className="w-full"
                    delay={0.05}
                    y={14}
                    scale={0.985}
                    duration={1.0}
                  >
                    <Recognitions />
                  </ScrollReveal>
                  <ScrollReveal
                    className="w-full"
                    delay={0.05}
                    y={10}
                    scale={0.99}
                    duration={0.95}
                  >
                    <Footer />
                  </ScrollReveal>
                </div>
              </section>
            </div>
          </div>
        </main>
      </ScrollAnimation>
    </>
  );
}
