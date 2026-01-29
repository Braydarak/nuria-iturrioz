import { useState, useMemo } from "react";
import recognitionsData from "../../data/recognitions.json";

// Import all recognition images eagerly
const recognitionImages = import.meta.glob(
  "../../assets/recognitions/*.{png,webp,jpg,jpeg,avif}",
  {
    eager: true,
    import: "default",
  }
);

const Recognitions = () => {
  const [visibleCount, setVisibleCount] = useState(4);

  const getImagePath = (jsonPath: string) => {
    const filename = jsonPath.split("/").pop();
    if (!filename) return "";

    const imageKey = Object.keys(recognitionImages).find((key) =>
      key.endsWith(filename)
    );

    return imageKey ? (recognitionImages[imageKey] as string) : "";
  };

  const totalItems = recognitionsData.recognitions.length;

  const itemsToRender = useMemo(() => {
    return recognitionsData.recognitions.slice(0, visibleCount);
  }, [visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  return (
    <section className="w-full bg-transparent py-20 relative overflow-hidden">
      {/* Background decoration */}

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="font-signature text-4xl md:text-5xl text-[#2A579E] text-center mb-16 tracking-tight">
          Reconocimientos
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {itemsToRender.map((recognition, index) => {
            // Logic to hide items 3 and 4 on mobile for the "preview" feel
            const isHiddenOnMobile =
              index >= 2 && index < 4 && visibleCount <= 4;

            return (
              <div
                key={recognition.id}
                className={`group flex flex-col ${
                  isHiddenOnMobile ? "hidden md:flex" : "flex"
                }`}
              >
                <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 transition-all duration-300 group-hover:shadow-[0_15px_30px_rgb(0,0,0,0.06)] group-hover:-translate-y-1 h-full flex flex-col items-center justify-between gap-6 relative overflow-hidden">
                  {/* Image Container */}
                  <div className="relative w-full aspect-4/5 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-radial-gradient from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {getImagePath(recognition.image) ? (
                      <img
                        src={getImagePath(recognition.image)}
                        alt={recognition.name || "Reconocimiento"}
                        className="relative z-10 max-w-full max-h-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-gray-300 text-xs uppercase tracking-widest font-bold">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  {recognition.name && (
                    <div className="w-full text-center border-t border-gray-200/50 pt-4 mt-auto">
                      <p className="text-[#1B3A75] text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed line-clamp-3">
                        {recognition.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        <div className="mt-16 flex justify-center">
          {visibleCount < totalItems && (
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
          )}
        </div>
      </div>
    </section>
  );
};

export default Recognitions;
