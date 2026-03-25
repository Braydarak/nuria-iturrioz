import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import Nuria1 from "../../assets/nuria/Nuria1.jpg";
import Nuria2 from "../../assets/nuria/Nuria2.jpg";
import Nuria3 from "../../assets/nuria/Nuria3.JPG";
import Nuria5 from "../../assets/nuria/Nuria5.jpg";
import Nuria10 from "../../assets/nuria/Nuria10.jpg";
import Nuria11 from "../../assets/nuria/Nuria11.JPG";
import Nuria13 from "../../assets/nuria/Nuria13.jpg";

interface BioSection {
  id: string;
  titleKey: string;
  defaultTitle: string;
  contentKey: string;
  defaultContent: string;
  image: string;
  year?: string;
}

const BIO_SECTIONS: BioSection[] = [
  {
    id: "beginnings",
    titleKey: "bio.beginningsTitle",
    defaultTitle: "The Beginning",
    contentKey: "bio.beginningsContent",
    defaultContent:
      "Nuria was born in Son Servera, Mallorca, on November 16, 1995. Her passion for golf started early in her beautiful hometown.",
    image: Nuria1,
    year: "1995",
  },
  {
    id: "amateur",
    titleKey: "bio.amateurTitle",
    defaultTitle: "Amateur Success",
    contentKey: "bio.amateurContent",
    defaultContent:
      "Before turning pro, she dominated the amateur scene, winning the Madrid Ladies Championship (2012) and the Spanish International Stroke Play (2013, 2014).",
    image: Nuria2,
    year: "2012-2014",
  },
  {
    id: "pro",
    titleKey: "bio.proTitle",
    defaultTitle: "Turning Professional",
    contentKey: "bio.proContent",
    defaultContent:
      "After a successful amateur career, Nuria turned professional in 2015, ready to take on the world stage after finishing 4th at Q-School.",
    image: Nuria5,
    year: "2015",
  },
  {
    id: "rookie",
    titleKey: "bio.rookieTitle",
    defaultTitle: "Rookie Victory",
    contentKey: "bio.rookieContent",
    defaultContent:
      "In her rookie year on the Ladies European Tour (2016), Nuria stunned the field by winning the Lalla Meryem Cup in Morocco by six strokes.",
    image: Nuria3,
    year: "2016",
  },
  {
    id: "morocco_again",
    titleKey: "bio.moroccoAgainTitle",
    defaultTitle: "Queen of Morocco",
    contentKey: "bio.moroccoAgainContent",
    defaultContent:
      "Nuria returned to the Lalla Meryem Cup in 2019 and claimed the title for a second time, proving her dominance at Royal Golf Dar Es Salam.",
    image: Nuria5,
    year: "2019",
  },
  {
    id: "dubai",
    titleKey: "bio.dubaiTitle",
    defaultTitle: "Moonlight Magic",
    contentKey: "bio.dubaiContent",
    defaultContent:
      "Just days after her win in Morocco, she triumphed at the Omega Dubai Moonlight Classic, winning the first-ever professional day-night tournament.",
    image: Nuria10,
    year: "2019",
  },
  {
    id: "lasella",
    titleKey: "bio.laSellaTitle",
    defaultTitle: "Home Soil Victory",
    contentKey: "bio.laSellaContent",
    defaultContent:
      "In 2023, Nuria won the La Sella Open in Spain after a thrilling playoff, celebrating an emotional victory in front of her home fans.",
    image: Nuria11,
    year: "2023",
  },
  {
    id: "houston",
    titleKey: "bio.houstonTitle",
    defaultTitle: "Conquering Houston",
    contentKey: "bio.houstonContent",
    defaultContent:
      "Most recently, in 2025, she secured a massive win at the Aramco Houston Championship, showcasing her world-class talent on American soil.",
    image: Nuria13,
    year: "2025",
  },
  {
    id: "current",
    titleKey: "bio.currentTitle",
    defaultTitle: "The Journey Continues",
    contentKey: "bio.currentContent",
    defaultContent:
      "With 5 major LET titles and counting, Nuria continues to compete with passion and determination, representing Spanish golf across the globe.",
    image: Nuria1,
    year: "Now",
  },
];

interface BioExperienceProps {
  onPlayGame?: () => void;
}

const BioExperience = ({ onPlayGame }: BioExperienceProps) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial entrance animation
    const tl = gsap.timeline();
    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 },
    );
  }, []);

  useEffect(() => {
    // Animate content change
    const tl = gsap.timeline();

    tl.fromTo(
      imageRef.current,
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
    ).fromTo(
      textRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
      "-=0.8",
    );
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < BIO_SECTIONS.length - 1) {
      // Animate out
      gsap.to(textRef.current, {
        opacity: 0,
        x: -50,
        duration: 0.3,
        onComplete: () => setCurrentIndex((prev) => prev + 1),
      });
      gsap.to(imageRef.current, {
        opacity: 0,
        duration: 0.3,
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      gsap.to(textRef.current, {
        opacity: 0,
        x: 50,
        duration: 0.3,
        onComplete: () => setCurrentIndex((prev) => prev - 1),
      });
      gsap.to(imageRef.current, {
        opacity: 0,
        duration: 0.3,
      });
    }
  };

  const currentSection = BIO_SECTIONS[currentIndex];
  const isLast = currentIndex === BIO_SECTIONS.length - 1;

  return (
    // Fixed height and aspect ratio to ensure consistency.
    // Using a flex-row layout that forces 50/50 split.
    <div
      ref={containerRef}
      className="flex flex-col md:flex-row w-full max-w-5xl h-auto md:h-[600px] bg-white rounded-2xl overflow-hidden shadow-2xl mx-auto"
    >
      {/* Image Section - Image Top on Mobile, Left on Desktop */}
      <div className="w-full md:w-1/2 relative h-64 md:h-full overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img
          ref={imageRef}
          src={currentSection.image}
          alt={currentSection.defaultTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-6 left-6 z-20 text-white">
          <div className="text-6xl font-black opacity-20 absolute -top-16 -left-4 select-none">
            {currentSection.year}
          </div>
          <div className="text-2xl font-bold relative">
            {currentSection.year}
          </div>
        </div>
      </div>

      {/* Content Section - Text Bottom on Mobile, Right on Desktop */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative shrink-0">
        <div ref={textRef}>
          <div className="text-[#004b9f] font-bold text-xs md:text-sm tracking-widest uppercase mb-2 md:mb-4">
            {t("bio.chapter", "Chapter")} {currentIndex + 1} /{" "}
            {BIO_SECTIONS.length}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            {t(currentSection.titleKey, currentSection.defaultTitle)}
          </h2>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6 md:mb-10 min-h-[100px] md:min-h-[120px]">
            {t(currentSection.contentKey, currentSection.defaultContent)}
          </p>

          <div className="flex gap-4 items-center mt-auto">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full border border-gray-200 transition-all ${
                currentIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-gray-50 hover:border-[#004b9f] text-[#004b9f] cursor-pointer"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {isLast ? (
              onPlayGame && (
                <button
                  onClick={onPlayGame}
                  className="flex-1 px-8 py-3 bg-[#004b9f] text-white rounded-full font-bold hover:bg-[#003875] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span>{t("bio.playTrivia", "Test Your Knowledge")}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 px-8 py-3 bg-[#004b9f] text-white rounded-full font-bold hover:bg-[#003875] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t("common.next", "Next")}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioExperience;
