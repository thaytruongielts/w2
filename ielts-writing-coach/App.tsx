import React, { useState, useCallback, useMemo } from 'react';
import { evaluateIntroduction, evaluatePracticeAttempt } from './services/geminiService';
import EvaluationDisplay from './components/EvaluationDisplay';
import { IELTS_WRITING_TASK_2_TOPICS } from './constants';
import type { Evaluation, PracticeEvaluation } from './types';

const App: React.FC = () => {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for the practice feature
  const [practiceAnswer, setPracticeAnswer] = useState<string>("");
  const [practiceEvaluation, setPracticeEvaluation] = useState<PracticeEvaluation | null>(null);
  const [isPracticeLoading, setIsPracticeLoading] = useState<boolean>(false);


  const currentTopic = useMemo(() => IELTS_WRITING_TASK_2_TOPICS[currentTopicIndex], [currentTopicIndex]);

  const resetPracticeState = () => {
    setPracticeAnswer("");
    setPracticeEvaluation(null);
  };

  const handleNewTopic = useCallback(() => {
    const newIndex = Math.floor(Math.random() * IELTS_WRITING_TASK_2_TOPICS.length);
    setCurrentTopicIndex(newIndex);
    setUserAnswer("");
    setEvaluation(null);
    setError(null);
    resetPracticeState();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim() || isLoading) return;

    setIsLoading(true);
    setEvaluation(null);
    setError(null);
    resetPracticeState();

    try {
      const result = await evaluateIntroduction(currentTopic, userAnswer);
      setEvaluation(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while evaluating your answer.');
    } finally {
      setIsLoading(false);
    }
  }, [currentTopic, userAnswer, isLoading]);

  const handlePracticeSubmit = useCallback(async () => {
    if (!practiceAnswer.trim() || !evaluation?.highBandAnswer || isPracticeLoading) return;

    setIsPracticeLoading(true);
    setPracticeEvaluation(null);
    setError(null);

    try {
        const result = await evaluatePracticeAttempt(evaluation.highBandAnswer, practiceAnswer);
        setPracticeEvaluation(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while checking your practice attempt.');
    } finally {
        setIsPracticeLoading(false);
    }
  }, [practiceAnswer, evaluation, isPracticeLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-gradient-to-br from-sky-50 to-indigo-100">
      <main className="w-full max-w-3xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">IELTS Writing Coach</h1>
          <p className="text-slate-600 mt-2 text-lg">Practice your Task 2 introductions and get instant AI feedback.</p>
        </header>

        {/* Topic Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Your Topic:</h2>
                <button 
                    onClick={handleNewTopic}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm"
                >
                    New Topic
                </button>
            </div>
            <p className="text-slate-700 text-base leading-relaxed bg-slate-50 p-4 rounded-md border-l-4 border-indigo-400">
                {currentTopic}
            </p>
        </div>

        {/* User Input Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-full transition-all">
          <label htmlFor="answer-input" className="block text-lg font-semibold text-slate-800 mb-3">
            Your Introduction:
          </label>
          <textarea
            id="answer-input"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your introduction here..."
            className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            aria-label="Your introduction"
          />
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || isLoading}
            className="mt-4 w-full px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Evaluating...
              </>
            ) : (
                'Evaluate Introduction'
            )}
          </button>
        </div>
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow animate-fade-in" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        {evaluation && !isLoading && (
            <EvaluationDisplay 
                evaluation={evaluation}
                practiceAnswer={practiceAnswer}
                onPracticeAnswerChange={setPracticeAnswer}
                onPracticeSubmit={handlePracticeSubmit}
                isPracticeLoading={isPracticeLoading}
                practiceEvaluation={practiceEvaluation}
            />
        )}

      </main>
      <footer className="text-center mt-8 text-slate-500">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
