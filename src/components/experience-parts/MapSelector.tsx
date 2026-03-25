import { useState, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

// GeoJSON for the world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapSelectorProps {
  onSelectCountry: (countryName: string) => void;
}

const MapSelector = ({ onSelectCountry }: MapSelectorProps) => {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    )
      .fromTo(
        mapRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
        "-=0.4",
      )
      .fromTo(
        formRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6",
      );
  }, []);

  const handleCountryClick = (geo: { properties: { name: string } }) => {
    const { name } = geo.properties;
    setSelectedCountry(name);
    setInputValue(name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedCountry(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Animate out before proceeding
      const tl = gsap.timeline({
        onComplete: () => onSelectCountry(inputValue),
      });

      tl.to([titleRef.current, mapRef.current, formRef.current], {
        opacity: 0,
        y: -20,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.in",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full min-h-[600px] p-4"
    >
      <h2
        ref={titleRef}
        className="text-3xl md:text-4xl font-bold text-[#004b9f] mb-8 text-center opacity-0"
      >
        {t("experience.whereAreYouFrom", "Where are you from?")}
      </h2>

      <div
        ref={mapRef}
        className="w-full max-w-5xl aspect-[1.8] border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm mb-8 opacity-0"
      >
        <ComposableMap
          projectionConfig={{ scale: 150 }}
          className="w-full h-full"
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isSelected = selectedCountry === geo.properties.name;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        default: {
                          fill: isSelected ? "#004b9f" : "#ffffff",
                          stroke: "#004b9f",
                          strokeWidth: 0.75,
                          outline: "none",
                          transition: "all 250ms",
                        },
                        hover: {
                          fill: "#004b9f",
                          stroke: "#004b9f",
                          strokeWidth: 0.75,
                          fillOpacity: 0.5,
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 250ms",
                        },
                        pressed: {
                          fill: "#004b9f",
                          stroke: "#004b9f",
                          strokeWidth: 0.75,
                          outline: "none",
                          transition: "all 250ms",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <form
        ref={formRef}
        onSubmit={handleInputSubmit}
        className="w-full max-w-md opacity-0"
      >
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={t("experience.enterCountry", "Enter your country...")}
            className="w-full px-6 py-4 text-lg border-2 border-[#004b9f] rounded-full focus:outline-none focus:ring-4 focus:ring-[#004b9f]/20 transition-all text-center text-[#004b9f] placeholder-[#004b9f]/50 font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#004b9f] text-white p-2.5 rounded-full hover:bg-[#003875] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MapSelector;
