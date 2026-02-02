import { useEffect, useRef, useState } from "react";
import Trophies from "../../components/trophies";
import Recognitions from "../../components/recognitions";
import { useTranslation } from "react-i18next";

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
  const [isMuted, setIsMuted] = useState(false);

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
    <main className="relative mx-auto max-w-screen px-4 pt-50 pb-16 min-h-screen flex items-center justify-center">
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

      <section
        aria-labelledby="career-title"
        className="relative max-w-full flex flex-col items-center z-10 mx-auto text-center"
      >
        <div className="max-w-3xl mb-10">
          <h1
            id="career-title"
            className="font-signature text-4xl md:text-5xl text-[#2A579E] mb-10 tracking-tight"
          >
            {t("career.title")}
          </h1>

          <div className="space-y-6 leading-relaxed text-black/90 text-lg md:text-xl">
            <p>{t("career.p1")}</p>
            <p>{t("career.p2")}</p>
            <p>{t("career.p3")}</p>
            <p>{t("career.p4")}</p>
            <p>{t("career.p5")}</p>
            <p>{t("career.p6")}</p>
          </div>

          <div className="mt-8">
            <div className="relative group rounded-xl overflow-hidden shadow-md">
              <div id="yt-player" className="w-full aspect-video bg-black" />

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
                    isMuted ? t("career.video.unmute") : t("career.video.mute")
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
        </div>
        <Trophies variant="career" />
        <Recognitions />
      </section>
    </main>
  );
}
