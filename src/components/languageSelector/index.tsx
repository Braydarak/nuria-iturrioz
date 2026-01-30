import { useState, useRef, useEffect } from "react";

type Language = "ES" | "EN" | "CA";

interface LanguageOption {
  code: Language;
  label: string;
}

const languages: LanguageOption[] = [
  { code: "ES", label: "Español" },
  { code: "EN", label: "English" },
  { code: "CA", label: "Català" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("ES");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);
    console.log(`Language changed to: ${lang}`);
  };

  return (
    <div className="relative font-header" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-black text-xl font-medium hover:text-[#2A579E] transition-colors focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentLang}</span>
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
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#2A579E]" : "text-black/60"
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-3 w-32 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 py-2 z-50 overflow-hidden transition-all duration-300 origin-top-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 visible"
            : "opacity-0 scale-95 -translate-y-2 invisible"
        }`}
      >
        <ul role="listbox">
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-5 py-2.5 text-md transition-all duration-200 flex items-center justify-between ${
                  currentLang === lang.code
                    ? "text-[#2A579E] font-bold bg-[#2A579E]/5"
                    : "text-gray-600 hover:text-[#2A579E] hover:bg-gray-50"
                }`}
                role="option"
                aria-selected={currentLang === lang.code}
              >
                {lang.label}
                {currentLang === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A579E]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
