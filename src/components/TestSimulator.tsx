import { useState, useEffect } from "react";
import { AlertCircle, Clock, CheckCircle2, Award, ChevronRight, ChevronLeft, Send, X } from "lucide-react";

interface TestSimulatorProps {
  testId: number;
  testTitle: string;
  numberOfQuestions: number;
  duration: number; // in seconds
  onClose: () => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which of the following sites of Harappan Civilisation is known to have yielded evidence of a ploughed field?",
    options: ["Kalibangan", "Lothal", "Mohenjo-daro", "Harappa"],
    correctIndex: 0,
    explanation: "Kalibangan in Rajasthan has yielded evidence of a ploughed field from its early Harappan phase. This is one of the earliest ploughed field archaeological evidences discovered."
  },
  {
    id: 2,
    text: "Who among the following was the founder of the Nanda Dynasty of Magadha in ancient India?",
    options: ["Dhana Nanda", "Mahapadma Nanda", "Ajatashatru", "Bimbisara"],
    correctIndex: 1,
    explanation: "Mahapadma Nanda was the powerful founder of the Nanda Dynasty of Magadha. He is described in Puranas as 'Ekarat' or the sole monarch who destroyed all other Kshatriya dynasties."
  },
  {
    id: 3,
    text: "At which Buddhist Council was the Abhidhamma Pitaka compiled and added to the Buddhist scriptures?",
    options: ["First Buddhist Council", "Second Buddhist Council", "Third Buddhist Council", "Fourth Buddhist Council"],
    correctIndex: 2,
    explanation: "The Abhidhamma Pitaka was compiled during the Third Buddhist Council convened at Pataliputra under the patronage of Emperor Ashoka and the presidency of Moggaliputta Tissa."
  },
  {
    id: 4,
    text: "As per the recent reports (2025 CA), which Indian State has secured the highest FDI inflows under the State-wise investment reports?",
    options: ["Gujarat", "Maharashtra", "Tamil Nadu", "Karnataka"],
    correctIndex: 1,
    explanation: "Maharashtra consistently ranks at the top for national Foreign Direct Investment (FDI) inflows, followed robustly by Gujarat and Karnataka in recent economic reviews."
  },
  {
    id: 5,
    text: "Under which article of the Constitution of India are emergency provisions defined in relation to UPPCS administration governance?",
    options: ["Article 352-360", "Article 368-372", "Article 280-285", "Article 324-329"],
    correctIndex: 0,
    explanation: "Part XVIII of the Constitution contains Articles 352 to 360 which deal with 3 types of Emergencies: National emergency, President's rule (State emergency), and Financial emergency."
  }
];

export default function TestSimulator({ testTitle, numberOfQuestions, duration, onClose }: TestSimulatorProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (!isTestStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, isSubmitted]);

  const handleStart = () => {
    setIsTestStarted(true);
    // Standardize to 300 seconds (5 mins) for quick preview gameplay so teachers can review without 2 hours wait
    setTimeLeft(Math.min(duration, 300)); 
  };

  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const score = SAMPLE_QUESTIONS.reduce((acc, q) => {
    if (selectedAnswers[q.id] === q.correctIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const formatTimer = (totSeconds: number) => {
    const mins = Math.floor(totSeconds / 60);
    const secs = totSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isTestStarted) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 max-w-xl mx-auto shadow-xl animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <div className="bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded text-xs">
            OMR Test Portal
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
          {testTitle}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Official state civil services exam simulated series. Practice and check your timing precision.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-55/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Questions</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">{numberOfQuestions} MCQs</p>
            </div>
          </div>

          <div className="bg-slate-55/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Duration</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">120 Minutes</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-850 pt-5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Go Back
          </button>
          
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-indigo-500/10 active:scale-97 transition-all"
          >
            Start Test Practice
          </button>
        </div>
      </div>
    );
  }

  // Active question block
  const activeQ = SAMPLE_QUESTIONS[currentIdx];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-slide-up max-w-4xl mx-auto">
      
      {/* Simulator header bar */}
      <div className="bg-slate-55/80 dark:bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-150 dark:border-slate-850">
        <div className="space-y-0.5">
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest font-mono">
            UPPSC Practice simulator
          </span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm md:max-w-md">
            {testTitle}
          </h4>
        </div>

        {/* Live Timer progress */}
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 font-bold text-xs font-mono">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {!isSubmitted ? (
        <div className="p-6 md:p-8">
          
          {/* Question grid navigation bullets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs transition-all ${
                  idx === currentIdx
                    ? "bg-indigo-600 text-white"
                    : selectedAnswers[q.id] !== undefined
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-75s"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Active Question body card */}
          <div className="min-h-[160px] bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-6 rounded-2xl mb-6">
            <span className="text-[10px] text-slate-400 font-mono font-bold block mb-1">
              QUESTION {currentIdx + 1} OF {SAMPLE_QUESTIONS.length}
            </span>
            <p className="text-sm md:text-md text-slate-800 dark:text-slate-100 font-bold leading-relaxed mb-4">
              {activeQ.text}
            </p>
          </div>

          {/* Answer multi choice options */}
          <div className="space-y-3 mb-8">
            {activeQ.options.map((option, oIdx) => {
              const checked = selectedAnswers[activeQ.id] === oIdx;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(activeQ.id, oIdx)}
                  className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all group ${
                    checked
                      ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-500/10 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-semibold"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-xs">{option}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    checked ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-700 group-hover:border-slate-400"
                  }`}>
                    {checked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer view Controls */}
          <div className="border-t border-slate-100 dark:border-slate-855 pt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((p) => Math.max(p - 1, 0))}
              disabled={currentIdx === 0}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl font-semibold text-xs transition-colors ${
                currentIdx === 0
                  ? "border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIdx < SAMPLE_QUESTIONS.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((p) => Math.min(p + 1, SAMPLE_QUESTIONS.length - 1))}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
                type="button"
              >
                <span>Nest Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-emerald-500/10 transition-all font-mono"
                type="button"
              >
                <Send className="w-4 h-4" />
                <span>Submit Sheet</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Final grade submission screen card */
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-500/15 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4 animate-bounce">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
            Practice Sheet Submitted!
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Congratulations on completing the simulated test. Check complete analysis below.
          </p>

          {/* Diagnostic scorecard */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-6 w-full max-w-md grid grid-cols-2 gap-4 mb-8">
            <div className="text-center font-mono">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Score</p>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {score} / {SAMPLE_QUESTIONS.length}
              </p>
            </div>
            
            <div className="text-center font-mono">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Accuracy</p>
              <p className="text-2xl font-extrabold text-emerald-500">
                {Math.round((score / SAMPLE_QUESTIONS.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Answers breakdown with explanation dropouts */}
          <div className="w-full max-w-xl text-left space-y-4 mb-8">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
              Solutions & Explanations
            </h4>
            {SAMPLE_QUESTIONS.map((q, idx) => {
              const selectedIdx = selectedAnswers[q.id];
              const isCorrect = selectedIdx === q.correctIndex;
              return (
                <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {idx + 1}. {q.text}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono mt-1">
                        <span className="text-slate-400">Your Choice: <strong className={isCorrect ? "text-emerald-500" : "text-red-500"}>{selectedIdx !== undefined ? q.options[selectedIdx] : "Unanswered"}</strong></span>
                        <span className="text-slate-450">Correct Ans: <strong className="text-emerald-500">{q.options[q.correctIndex]}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-850 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    <span className="font-bold text-indigo-500 font-mono uppercase tracking-wider block mb-0.5">EXPLANATION:</span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
