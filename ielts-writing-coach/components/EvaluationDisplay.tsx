import React from 'react';
import type { Evaluation, PracticeEvaluation } from '../types';
import { CheckIcon, LightbulbIcon, SparklesIcon } from './icons';

interface EvaluationDisplayProps {
  evaluation: Evaluation;
  practiceAnswer: string;
  onPracticeAnswerChange: (value: string) => void;
  onPracticeSubmit: () => void;
  isPracticeLoading: boolean;
  practiceEvaluation: PracticeEvaluation | null;
}

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ 
  evaluation,
  practiceAnswer,
  onPracticeAnswerChange,
  onPracticeSubmit,
  isPracticeLoading,
  practiceEvaluation,
}) => {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy === 100) return 'bg-green-500';
    if (accuracy > 90) return 'bg-lime-500';
    if (accuracy > 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Your Feedback</h2>
      
      <div className="flex justify-center items-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-5xl font-bold text-blue-600">{evaluation.bandScore.toFixed(1)}</span>
          </div>
          <div className="absolute -top-2 -left-2 w-36 h-36 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <CheckIcon className="w-6 h-6 mr-2 text-green-600" />
            Strengths (Điểm mạnh)
          </h3>
          <ul className="space-y-2 list-inside">
            {evaluation.strengths.map((item, index) => (
              <li key={index} className="text-green-700 flex items-start">
                <span className="text-green-500 mr-2 mt-1">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            <LightbulbIcon className="w-6 h-6 mr-2 text-yellow-600" />
            Areas for Improvement (Cần cải thiện)
          </h3>
          <ul className="space-y-2 list-inside">
            {evaluation.improvements.map((item, index) => (
               <li key={index} className="text-yellow-700 flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">&#8250;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-blue-500" />
            High-Band Model Answer
          </h3>
          <blockquote className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500 text-slate-700 italic">
            {evaluation.highBandAnswer}
          </blockquote>
        </div>

        {/* Practice Section */}
        <div className="bg-slate-100 p-4 rounded-lg">
           <label htmlFor="practice-input" className="block text-md font-semibold text-slate-800 mb-3">
            Luyện gõ lại câu trả lời mẫu:
          </label>
          <textarea
            id="practice-input"
            value={practiceAnswer}
            onChange={(e) => onPracticeAnswerChange(e.target.value)}
            placeholder="Gõ lại câu trả lời mẫu ở trên vào đây..."
            className="w-full h-28 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            aria-label="Practice typing the model answer"
          />
          <button
            onClick={onPracticeSubmit}
            disabled={!practiceAnswer.trim() || isPracticeLoading}
            className="mt-3 w-full px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isPracticeLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : (
                'Check My Practice'
            )}
          </button>
          
          {practiceEvaluation && !isPracticeLoading && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg animate-fade-in border border-slate-200">
              <h4 className="font-semibold text-slate-700">Practice Result:</h4>
              <div className="w-full bg-slate-200 rounded-full h-2.5 my-2">
                <div 
                  className={`h-2.5 rounded-full transition-all ${getAccuracyColor(practiceEvaluation.accuracy)}`}
                  style={{ width: `${practiceEvaluation.accuracy}%` }}>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-bold">Accuracy: {practiceEvaluation.accuracy}%</span> - {practiceEvaluation.feedback}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EvaluationDisplay;
