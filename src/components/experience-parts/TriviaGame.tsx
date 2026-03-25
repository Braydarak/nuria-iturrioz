import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

interface Question {
  id: number;
  questionKey: string;
  defaultQuestion: string;
  options: { label: string; value: string | boolean; isCorrect: boolean }[];
}

interface TriviaGameProps {
  onLearnMore?: () => void;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    questionKey: "trivia.age",
    defaultQuestion: "How old is Nuria?",
    options: [
      { label: "30", value: "30", isCorrect: true },
      { label: "24", value: "24", isCorrect: false },
      { label: "32", value: "32", isCorrect: false },
      { label: "29", value: "29", isCorrect: false },
    ],
  },
  {
    id: 2,
    questionKey: "trivia.letWins",
    defaultQuestion: "How many LET titles has she won?",
    options: [
      { label: "5", value: "5", isCorrect: true },
      { label: "4", value: "4", isCorrect: false },
      { label: "3", value: "3", isCorrect: false },
      { label: "2", value: "2", isCorrect: false },
      { label: "6", value: "6", isCorrect: false },
    ],
  },
  {
    id: 3,
    questionKey: "trivia.firstLet",
    defaultQuestion: "When did she win her first LET title?",
    options: [
      { label: "2019", value: "2019", isCorrect: false },
      { label: "2023", value: "2023", isCorrect: false },
      { label: "2017", value: "2017", isCorrect: false },
      { label: "2016", value: "2016", isCorrect: true },
    ],
  },
  {
    id: 4,
    questionKey: "trivia.proYear",
    defaultQuestion: "When did she turn professional?",
    options: [
      { label: "2014", value: "2014", isCorrect: false },
      { label: "2015", value: "2015", isCorrect: true },
      { label: "2013", value: "2013", isCorrect: false },
      { label: "2016", value: "2016", isCorrect: false },
    ],
  },
  {
    id: 5,
    questionKey: "trivia.birthplace",
    defaultQuestion: "Where was Nuria born?",
    options: [
      { label: "Son Servera", value: "Son Servera", isCorrect: true },
      { label: "Palma", value: "Palma", isCorrect: false },
      { label: "Madrid", value: "Madrid", isCorrect: false },
      { label: "Barcelona", value: "Barcelona", isCorrect: false },
    ],
  },
  {
    id: 6,
    questionKey: "trivia.backToBack",
    defaultQuestion: "Nuria won two tournaments in a row: True or False?",
    options: [
      { label: "True", value: true, isCorrect: true },
      { label: "False", value: false, isCorrect: false },
    ],
  },
];

const TriviaGame = ({ onLearnMore }: TriviaGameProps) => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<"start" | "playing" | "end">(
    "start",
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(
    null,
  );
  const [isAnswering, setIsAnswering] = useState(false); // To block clicks during transition

  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  // Initial animation
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
    );
  }, []);

  const handleStart = () => {
    // Animate out start screen
    gsap.to(questionRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        setGameState("playing");
        // Animate in first question
        gsap.fromTo(
          questionRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
        );
      },
    });
  };

  const handleAnswer = (value: string | boolean, isCorrect: boolean) => {
    if (isAnswering) return;
    setIsAnswering(true);
    setSelectedAnswer(value);

    if (isCorrect) setScore((s) => s + 1);

    // Highlight answer then move on
    setTimeout(() => {
      gsap.to(questionRef.current, {
        opacity: 0,
        x: -50,
        duration: 0.3,
        onComplete: () => {
          if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setIsAnswering(false);
            gsap.fromTo(
              questionRef.current,
              { opacity: 0, x: 50 },
              { opacity: 1, x: 0, duration: 0.5 },
            );
          } else {
            setGameState("end");
            gsap.fromTo(
              questionRef.current,
              { opacity: 0, scale: 0.8 },
              { opacity: 1, scale: 1, duration: 0.5, ease: "back.out" },
            );
          }
        },
      });
    }, 1000);
  };

  const restartGame = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswering(false);
    setGameState("start");
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl text-center min-h-[500px] flex flex-col justify-center"
    >
      {gameState === "start" && (
        <div ref={questionRef}>
          <h2 className="text-4xl font-bold text-[#004b9f] mb-6">
            {t("experience.triviaTitle", "Nuria Trivia Challenge")}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t(
              "experience.triviaIntro",
              "Let's see how much you really know about Nuria!",
            )}
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-[#004b9f] text-white text-xl font-bold rounded-full hover:bg-[#003875] transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            {t("experience.startGame", "Start Game")}
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div ref={questionRef} className="w-full max-w-2xl mx-auto">
          <div className="mb-8 flex justify-between items-center text-sm font-medium text-gray-400">
            <span>
              {t("experience.questionLabel", "Question")} {currentQuestionIndex + 1}{" "}
              / {QUESTIONS.length}
            </span>
            <span>
              {t("experience.scoreLabel", "Score")}: {score}
            </span>
          </div>

          <h3 className="text-3xl font-bold text-[#004b9f] mb-10 leading-tight">
            {t(currentQuestion.questionKey, currentQuestion.defaultQuestion)}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, idx) => {
              let btnClass =
                "p-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 cursor-pointer ";

              if (selectedAnswer === null) {
                btnClass +=
                  "border-gray-200 hover:border-[#004b9f] hover:bg-blue-50 text-gray-700";
              } else {
                if (opt.value === selectedAnswer) {
                  btnClass += opt.isCorrect
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-red-500 border-red-500 text-white";
                } else if (opt.isCorrect) {
                  btnClass += "bg-green-100 border-green-500 text-green-700"; // Show correct answer
                } else {
                  btnClass += "border-gray-200 text-gray-400 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.value, opt.isCorrect)}
                  disabled={selectedAnswer !== null}
                  className={btnClass}
                >
                  {typeof opt.value === "boolean"
                    ? t(opt.value ? "common.true" : "common.false")
                    : opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === "end" && (
        <div ref={questionRef} className="space-y-6">
          <h2 className="text-4xl font-bold text-[#004b9f]">
            {t("experience.quizComplete", "Quiz Complete!")}
          </h2>

          <div className="text-6xl font-black text-[#004b9f] my-8">
            {score} / {QUESTIONS.length}
          </div>

          <p className="text-xl text-gray-600 mb-8">
            {t(
              score === QUESTIONS.length
                ? "experience.results.perfect"
                : score > QUESTIONS.length / 2
                  ? "experience.results.great"
                  : "experience.results.try",
              score === QUESTIONS.length
                ? "Perfect! You are a true super fan!"
                : score > QUESTIONS.length / 2
                  ? "Great job! You know Nuria well."
                  : "Nice try! Keep following Nuria to learn more.",
            )}
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={restartGame}
              className="px-6 py-3 border-2 border-[#004b9f] text-[#004b9f] font-bold rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
            >
              {t("experience.playAgain", "Play Again")}
            </button>
            <button
              type="button"
              onClick={onLearnMore}
              className="px-6 py-3 bg-[#004b9f] text-white font-bold rounded-full hover:bg-[#003875] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!onLearnMore}
            >
              {t("experience.learnMore", "Learn more about Nuria")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriviaGame;
