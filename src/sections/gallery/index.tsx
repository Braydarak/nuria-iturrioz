import { useFlickrPhotos } from "../../data/last_letPhotos";
import AnimatedLoader from "../../components/animatedLoader";
import Masonry from "../../components/mansoryGrid";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

export default function MasonryGallery() {
  const { t } = useTranslation();
  const { photos, loading, error } = useFlickrPhotos();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !error && photos.length > 0 && buttonRef.current) {
      gsap.from(buttonRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
        clearProps: "all", // Ensures clean state after animation
      });
    }
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
        <a
          href="https://www.flickr.com/photos/99039037@N06/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-white text-[#2A579E] px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-sm uppercase tracking-wide"
        >
          {t("gallery.viewMoreFlickr")}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>

      {/* Bottom Fade/Shadow Effect - Section Level */}
    </section>
  );
}
