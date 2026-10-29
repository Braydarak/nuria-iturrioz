import { useTranslation } from "react-i18next";
import recognitionsData from "../../data/recognitions.json";

const recognitionImages = import.meta.glob(
  "../../assets/recognitions/*.{png,webp,jpg,jpeg,avif}",
  { eager: true, import: "default" },
) as Record<string, string>;

const getImagePath = (jsonPath: string) => {
  const filename = jsonPath.split("/").pop();
  if (!filename) return "";
  const key = Object.keys(recognitionImages).find((k) => k.endsWith(filename));
  return key ? recognitionImages[key] : "";
};

// Reconocimientos como cuadros colgados en la pared de una galería
const Recognitions = () => {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="recognitions-title"
      className="relative overflow-hidden bg-[#F4F1EA] py-24 md:py-32"
    >
      <div className="relative mx-auto max-w-6xl px-6">
        <header className="mb-16 md:mb-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#2A579E]/70">
            {t("recognitions.eyebrow")}
          </p>
          <h2
            id="recognitions-title"
            className="mt-3 font-signature text-5xl md:text-6xl text-[#2A579E]"
          >
            {t("recognitions.title")}
          </h2>
        </header>

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-14 md:gap-x-10 md:gap-y-20">
          {recognitionsData.recognitions.map((recognition) => {
            const src = getImagePath(recognition.image);
            const name = t(recognition.name);
            return (
              <li
                key={recognition.id}
                className="group flex flex-col items-center"
              >
                <figure className="flex w-full flex-col items-center">
                  {/* Cordel y clavo */}
                  <svg
                    className="h-7 w-24 text-[#8A7A62]"
                    viewBox="0 0 96 28"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 27 L48 4 L84 27"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <circle cx="48" cy="4" r="3" fill="#5C4E3A" />
                  </svg>

                  {/* Marco + paspartú */}
                  <div className="w-full rounded-[2px] bg-linear-to-br from-[#3B2E22] via-[#2A2018] to-[#1A140F] p-2 md:p-2.5 shadow-[0_22px_30px_-14px_rgba(40,30,15,0.55)] transition-transform duration-500 group-hover:-rotate-1">
                    <div className="flex aspect-4/5 items-center justify-center bg-[#FBFAF7] p-4 shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]">
                      {src && (
                        <img
                          src={src}
                          alt={name}
                          loading="lazy"
                          decoding="async"
                          className="max-h-full w-auto max-w-full object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* Cartela */}
                  <figcaption className="mt-5 w-full max-w-56 border-l-2 border-[#2A579E] bg-white px-3 py-2 text-left shadow-sm">
                    <span className="block text-[10px] md:text-[11px] font-bold uppercase leading-snug tracking-wide text-[#1B3A75]">
                      {name}
                    </span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Recognitions;
