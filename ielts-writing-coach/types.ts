
export interface Evaluation {
  bandScore: number;
  strengths: string[];
  improvements: string[];
  highBandAnswer: string;
}

export interface PracticeEvaluation {
  accuracy: number;
  feedback: string;
}
