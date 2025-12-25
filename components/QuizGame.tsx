import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { Theme, QuizConfig } from '../types';
import { Button } from './UIComponents';

interface QuizGameProps {
  theme: Theme;
  config: QuizConfig;
  onComplete: () => void;
  accentColor: string;
}

const QuizGame: React.FC<QuizGameProps> = ({ theme, config, onComplete, accentColor }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const currentQuestion = config.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === config.questions.length - 1;
  const isDark = theme === 'dark';

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const correct = selectedOption === currentQuestion.correctOptionIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct && isLastQuestion) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  if (!currentQuestion) return null;

  return (
    <div className={`w-full max-w-lg mx-auto p-8 rounded-3xl ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/60 border-rose-100'} backdrop-blur-xl border shadow-2xl relative overflow-hidden`}>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
        <div 
            className="h-full transition-all duration-500"
            style={{ 
                width: `${((currentQuestionIndex) / config.questions.length) * 100}%`,
                backgroundColor: accentColor 
            }}
        />
      </div>

      <div className="mb-8 text-center space-y-2 mt-2">
         <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 bg-slate-100/10 text-slate-500">
            <HelpCircle size={24} style={{ color: accentColor }} />
         </div>
         <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Question {currentQuestionIndex + 1} of {config.questions.length}
         </h3>
         <p className={`text-lg font-serif-display ${isDark ? 'text-indigo-200' : 'text-slate-600'}`}>
            {currentQuestion.question}
         </p>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option, idx) => {
            let stateClasses = "";
            
            if (isAnswered) {
                if (idx === currentQuestion.correctOptionIndex) {
                    stateClasses = "bg-green-500 text-white border-green-500";
                } else if (idx === selectedOption && idx !== currentQuestion.correctOptionIndex) {
                    stateClasses = "bg-red-500 text-white border-red-500";
                } else {
                    stateClasses = "opacity-50";
                }
            } else {
                stateClasses = selectedOption === idx 
                    ? `bg-white/20 border-current shadow-lg scale-[1.02]`
                    : `hover:bg-white/10 border-transparent hover:border-current`;
            }

            return (
                <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-300 flex items-center justify-between group ${isDark ? 'text-white' : 'text-slate-800'} ${stateClasses}`}
                    style={selectedOption === idx && !isAnswered ? { borderColor: accentColor } : {}}
                >
                    <span>{option}</span>
                    {isAnswered && idx === currentQuestion.correctOptionIndex && <Check size={20} />}
                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correctOptionIndex && <X size={20} />}
                </button>
            );
        })}
      </div>

      <div className="mt-8 flex justify-end h-12">
         {isAnswered ? (
             isCorrect ? (
                 !isLastQuestion ? (
                     <Button onClick={handleNext} accentColor={accentColor}>
                        Next Question <ArrowRight size={18} className="ml-2" />
                     </Button>
                 ) : (
                     <div className="flex items-center gap-2 text-green-500 font-bold animate-bounce">
                        <Check size={20} /> {config.successMessage}
                     </div>
                 )
             ) : (
                 <Button onClick={() => { setIsAnswered(false); setSelectedOption(null); }} variant="secondary" className="text-red-400 hover:text-red-500">
                    Try Again
                 </Button>
             )
         ) : (
             <Button 
                onClick={handleSubmit} 
                disabled={selectedOption === null}
                className={selectedOption === null ? 'opacity-50 cursor-not-allowed' : ''}
                accentColor={accentColor}
             >
                Check Answer
             </Button>
         )}
      </div>
    </div>
  );
};

export default QuizGame;