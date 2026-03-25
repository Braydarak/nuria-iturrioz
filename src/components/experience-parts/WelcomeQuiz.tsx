import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import nuriaGolfing from "../../assets/Nuria-golfing.png";
import gsap from "gsap";

interface WelcomeQuizProps {
  userCountry: string;
  onComplete: (data: QuizData) => void;
}

export interface QuizData {
  knowsNuria: boolean;
  howKnown?: string;
  followFrequency?: string;
  interest?: string;
}

const WelcomeQuiz = ({ userCountry, onComplete }: WelcomeQuizProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizData>({
    knowsNuria: false,
  });

  const imgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initial animation
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(imgRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(contentRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.5"
    );
  }, []);

  // Animation when step changes
  useEffect(() => {
    if (contentRef.current) {
        gsap.fromTo(contentRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }
  }, [step]);

  // Step 0: Welcome message
  // Step 1: Do you know Nuria?
  // Step 2: How do you know her? (If yes)
  // Step 3: Follow frequency? (If yes)
  // Step 4: Interest? (If no/finished)

  const handleOptionSelect = <K extends keyof QuizData>(
    key: K,
    value: QuizData[K],
  ) => {
    // Animate out current content before changing step
    gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
            setAnswers((prev) => ({ ...prev, [key]: value }));

            // Logic to determine next step
            if (key === "knowsNuria") {
              if (value === true) {
                setStep(2);
              } else {
                setStep(4);
              }
            } else if (key === "howKnown") {
              setStep(3);
            } else if (key === "followFrequency") {
                setStep(4);
            } else if (key === "interest") {
                // For final steps, we animate out everything
                gsap.to([imgRef.current], {
                    opacity: 0,
                    x: -50,
                    duration: 0.5,
                    onComplete: () => onComplete({ ...answers, [key]: value })
                });
            }
        }
    });
  };

  const handleStart = () => {
      gsap.to(contentRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          onComplete: () => setStep(1)
      });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-[#004b9f]">
              {t("experience.welcome", "Welcome from")} {userCountry}!
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t(
                "experience.introText",
                "We are glad to have you here. Let's get to know each other a little better before we start.",
              )}
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-[#004b9f] text-white rounded-full font-bold text-lg hover:bg-[#003875] transition-colors cursor-pointer"
            >
              {t("experience.start", "Start")}
            </button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-[#004b9f] text-center">
              {t("experience.question1", "Do you know Nuria Iturrioz?")}
            </h3>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => handleOptionSelect("knowsNuria", true)}
                className="px-8 py-4 border-2 border-[#004b9f] text-[#004b9f] rounded-xl text-xl font-bold hover:bg-[#004b9f] hover:text-white transition-all cursor-pointer"
              >
                {t("common.yes", "Yes")}
              </button>
              <button
                onClick={() => handleOptionSelect("knowsNuria", false)}
                className="px-8 py-4 border-2 border-gray-300 text-gray-500 rounded-xl text-xl font-bold hover:border-[#004b9f] hover:text-[#004b9f] transition-all cursor-pointer"
              >
                {t("common.no", "No")}
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-[#004b9f] text-center">
              {t("experience.question2", "How did you meet Nuria?")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
               {[
                 { id: "golf", label: t("experience.options.golfTournament", "Golf Tournament") },
                 { id: "social", label: t("experience.options.socialMedia", "Social Media") },
                 { id: "news", label: t("experience.options.newsPress", "News / Press") },
                 { id: "friend", label: t("experience.options.friendFamily", "Friend / Family") },
               ].map((opt) => (
                 <button
                   key={opt.id}
                   onClick={() => handleOptionSelect("howKnown", opt.id)}
                   className="p-4 border border-gray-200 rounded-lg hover:border-[#004b9f] hover:bg-blue-50 transition-all text-left font-medium text-gray-700 cursor-pointer"
                 >
                   {opt.label}
                 </button>
               ))}
            </div>
          </div>
        );
      case 3:
        return (
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-[#004b9f] text-center">
                {t("experience.question3", "Do you follow her career?")}
              </h3>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                 {[
                   { id: "habitually", label: t("experience.options.habitually", "Habitually") },
                   { id: "occasionally", label: t("experience.options.occasionally", "Occasionally") },
                   { id: "rarely", label: t("experience.options.rarely", "Rarely") },
                 ].map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => handleOptionSelect("followFrequency", opt.id)}
                     className="p-4 border border-gray-200 rounded-lg hover:border-[#004b9f] hover:bg-blue-50 transition-all text-center font-medium text-gray-700 cursor-pointer"
                   >
                     {opt.label}
                   </button>
                 ))}
              </div>
            </div>
          );
      case 4:
        return (
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-[#004b9f] text-center">
                {t("experience.question4", "What would you like to do?")}
              </h3>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                 {[
                   { id: "know_more", label: t("experience.options.knowMore", "I want to know more about her") },
                   { id: "play_quiz", label: t("experience.options.playQuiz", "Play a quiz about Nuria") },
                 ].map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => handleOptionSelect("interest", opt.id)}
                     className="p-4 border border-gray-200 rounded-lg hover:border-[#004b9f] hover:bg-blue-50 transition-all text-center font-medium text-gray-700 cursor-pointer"
                   >
                     {opt.label}
                   </button>
                 ))}
              </div>
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full h-full min-h-[600px] p-4">
      {/* Left side: Image */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end">
        <div ref={imgRef} className="relative w-full max-w-md aspect-3/4 rounded-2xl overflow-hidden shadow-2xl opacity-0">
          <img 
            src={nuriaGolfing} 
            alt="Nuria Iturrioz Golfing" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#004b9f]/80 to-transparent mix-blend-multiply pointer-events-none" />
        </div>
      </div>

      {/* Right side: Questions */}
      <div ref={contentRef} className="w-full md:w-1/2 flex flex-col justify-center opacity-0">
         {renderStep()}
      </div>
    </div>
  );
};

export default WelcomeQuiz;
