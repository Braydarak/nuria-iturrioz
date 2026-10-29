import { useFlickrPhotos } from "../../data/last_letPhotos";
import AnimatedLoader from "../../components/animatedLoader";
import Masonry from "../../components/mansoryGrid";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MasonryGallery() {
  const { t } = useTranslation();
  const { photos, loading, error } = useFlickrPhotos();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || error || !photos.length || !buttonRef.current) return;
    // El botón aparece cuando la galería llega a pantalla
    const tween = gsap.from(buttonRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: 0.4,
      ease: "power3.out",
      clearProps: "all",
      scrollTrigger: {
        trigger: buttonRef.current,
        start: "top 95%",
        once: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [loading, error, photos]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px]">
        <AnimatedLoader />
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (photos.length === 0) {
    return null;
  }

  // Map Flickr photos to Masonry items
  const masonryItems = photos
    .filter((p) => p.url_z || p.url_l)
    .map((photo) => ({
      id: photo.id,
      img: photo.url_l || photo.url_z || "",
      height: (photo.height_z || photo.width_z || 300) as number, // Fallback height
      url: `https://www.flickr.com/photos/${photo.owner}/${photo.id}`,
      title: photo.title, // Extra prop for custom use if needed
    }));

  return (
    <section className="relative w-full bg-white h-screen overflow-hidden flex flex-col">
      <div className="w-full px-4 md:px-8 flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-hidden">
            <Masonry
              items={masonryItems}
              animateFrom="bottom"
              stagger={0.1}
              scaleOnHover={true}
            />
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <div
        ref={buttonRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      >
        <Link
          to="/gallery"
          className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-[#2A579E] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          {t("gallery.viewAll")}
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* Degradado: las fotos se funden antes del footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-40 bg-linear-to-t from-white via-white/70 to-transparent md:h-56" />
    </section>
  );
}
