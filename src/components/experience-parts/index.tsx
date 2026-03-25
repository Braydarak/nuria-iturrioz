import { useState } from "react";
import MapSelector from "./MapSelector";
import WelcomeQuiz, { type QuizData } from "./WelcomeQuiz";
import BioExperience from "./BioExperience";
import TriviaGame from "./TriviaGame";

const ExperienceParts = () => {
  const [step, setStep] = useState<"map" | "welcome" | "bio" | "trivia">("map");
  const [userCountry, setUserCountry] = useState<string | null>(null);

  const handleCountrySelect = (country: string) => {
    setUserCountry(country);
    // Wait for exit animation
    setTimeout(() => {
      setStep("welcome");
    }, 800);
    console.log("User selected country:", country);
  };

  const handleQuizComplete = (data: QuizData) => {
    console.log("Quiz completed:", data);
    // Wait for exit animation
    setTimeout(() => {
      if (data.interest === "know_more") {
        setStep("bio");
      } else {
        setStep("trivia");
      }
    }, 800);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 pb-20 relative z-10">
      <div className="w-full max-w-6xl mx-auto">
        {step === "map" && (
          <MapSelector onSelectCountry={handleCountrySelect} />
        )}

        {step === "welcome" && userCountry && (
          <WelcomeQuiz
            userCountry={userCountry}
            onComplete={handleQuizComplete}
          />
        )}

        {step === "bio" && (
          <BioExperience onPlayGame={() => setStep("trivia")} />
        )}

        {step === "trivia" && <TriviaGame onLearnMore={() => setStep("bio")} />}
      </div>
    </div>
  );
};

export default ExperienceParts;
