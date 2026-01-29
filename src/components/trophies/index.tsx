import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import trophiesData from "../../data/trophies.json";

// Import all trophy images eagerly
const trophyImages = import.meta.glob(
  "../../assets/trophies/*.{png,webp,jpg,jpeg,avif}",
  {
    eager: true,
    import: "default",
  }
);

interface TrophiesProps {
  variant?: "home" | "career";
}

const Trophies = ({ variant = "home" }: TrophiesProps) => {
  const [visibleCount, setVisibleCount] = useState(4);

  const getImagePath = (jsonPath: string) => {
    const filename = jsonPath.split("/").pop();
    if (!filename) return "";

    const imageKey = Object.keys(trophyImages).find((key) =>
      key.endsWith(filename)
    );

    return imageKey ? (trophyImages[imageKey] as string) : "";
  };

  const totalItems = trophiesData.trophies.length;

  const [homeItems, setHomeItems] = useState<typeof trophiesData.trophies>([]);

  useEffect(() => {
    if (variant === "home") {
      const timeout = setTimeout(() => {
        setHomeItems(
          [...trophiesData.trophies].sort(() => 0.5 - Math.random()).slice(0, 4)
        );
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [variant]);

  const itemsToRender =
    variant === "home"
      ? homeItems.length > 0
        ? homeItems
        : trophiesData.trophies.slice(0, 4)
      : trophiesData.trophies.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  return (
    <section className="w-full bg-transparent py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
              <h2
          className="font-signature text-4xl text-center md:text-5xl text-[#2A579E] mb-10 tracking-tight">
          Mis Trofeos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {itemsToRender.map((trophy, index) => {
            const isHiddenOnMobile =
              index >= 2 &&
              index < 4 &&
              (variant === "home" || visibleCount <= 4);

            return (
              <div
                key={trophy.id}
                className={`group flex flex-col ${
                  isHiddenOnMobile ? "hidden md:flex" : "flex"
                }`}
              >
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group-hover:-translate-y-2 h-full flex flex-col items-center justify-between gap-6 relative overflow-hidden">
                  <div className="relative w-full aspect-4/5 flex items-center justify-center">
                    <div className="absolute inset-0 bg-radial-gradient from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {getImagePath(trophy.image) ? (
                      <img
                        src={getImagePath(trophy.image)}
                        alt={trophy.name || "Trofeo"}
                        className="relative z-10 max-w-full max-h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="text-gray-300 text-xs uppercase tracking-widest font-bold">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  {trophy.name && (
                    <div className="w-full text-center border-t border-gray-50 pt-4 mt-auto">
                      <p className="text-[#1B3A75] text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed line-clamp-3">
                        {trophy.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="mt-16 flex justify-center">
          {variant === "home" ? (
            <Link
              to="/career"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#1B3A75] text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-[#2A579E] hover:shadow-blue-900/20 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Ver todos los trofeos</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          ) : (
            visibleCount < totalItems && (
              <button
                onClick={handleLoadMore}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-[#1B3A75] text-[#1B3A75] rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#1B3A75] hover:text-white transition-all duration-300"
              >
                <span>Cargar más</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Trophies;
