import { useFlickrPhotos } from "../../data/last_letPhotos";
import AnimatedLoader from "../../components/animatedLoader";
import Masonry from "../../components/mansoryGrid";
import { useTranslation } from "react-i18next";

export default function MasonryGallery() {
  const { t } = useTranslation();
  const { photos, loading, error } = useFlickrPhotos();
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
    <section className="bg-white pb-6 pt-16 md:pb-10 md:pt-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-signature text-4xl text-[#2A579E] md:text-5xl">
            {t("gallery.title")}
          </h2>
          <a
            href="https://www.flickr.com/photos/99039037@N06/"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1B3A75] hover:text-[#2A579E]"
          >
            {t("gallery.viewMoreFlickr")}
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 3h7v7" />
              <path d="M10 14 21 3" />
              <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
            </svg>
          </a>
        </header>

        {/* Altura limitada con un degradado al final en vez de un corte seco */}
        <div className="relative max-h-[900px] overflow-hidden md:max-h-[1000px]">
          <Masonry
            items={masonryItems}
            animateFrom="bottom"
            stagger={0.1}
            scaleOnHover={true}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-white via-white/80 to-transparent" />
        </div>
      </div>
    </section>
  );
}
