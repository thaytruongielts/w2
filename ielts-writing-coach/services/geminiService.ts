import { GoogleGenAI, Type } from "@google/genai";
import type { Evaluation, PracticeEvaluation } from "../types";

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    bandScore: {
      type: Type.NUMBER,
      description: "An estimated IELTS band score between 1.0 and 9.0 for the introduction."
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of strengths of the user's introduction."
    },
    improvements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of areas for improvement."
    },
    highBandAnswer: {
      type: Type.STRING,
      description: "A model introduction that would score a 7.0 or higher."
    },
  },
  required: ["bandScore", "strengths", "improvements", "highBandAnswer"]
};

const practiceEvaluationSchema = {
  type: Type.OBJECT,
  properties: {
    accuracy: {
      type: Type.NUMBER,
      description: "An accuracy score from 0 to 100 representing how closely the user's answer matches the model answer. 100 means a perfect match."
    },
    feedback: {
      type: Type.STRING,
      description: "A brief, encouraging comment on the user's accuracy. If there are mistakes, point out one or two specific examples of typos, punctuation, or capitalization errors."
    },
  },
  required: ["accuracy", "feedback"]
};


export async function evaluateIntroduction(topic: string, answer: string): Promise<Evaluation> {
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using mocked data for main evaluation.");
    return new Promise(resolve => setTimeout(() => resolve({
      bandScore: 6.5,
      strengths: ["Good paraphrasing of the topic.", "Clearly states the essay's intention."],
      improvements: ["Use more varied vocabulary.", "The thesis statement could be more specific."],
      highBandAnswer: "It is often argued that compelling high school students to participate in unpaid work for the community should be a mandatory component of their curriculum. This essay wholeheartedly agrees with this proposition because such initiatives foster a sense of civic duty and equip adolescents with invaluable practical skills."
    }), 1500));
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: `Please evaluate the following IELTS Writing Task 2 introduction based on the provided topic. Provide your feedback in the specified JSON format.

Topic: "${topic}"

Student's Introduction: "${answer}"
`,
    config: {
      systemInstruction: "You are a professional IELTS examiner specializing in Writing Task 2. Your task is to evaluate a student's introduction and provide a band score estimate, strengths, areas for improvement, and a high-band model answer. Your feedback should be constructive and aimed at helping the student reach Band 7 or higher.",
      responseMimeType: "application/json",
      responseSchema: evaluationSchema,
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as Evaluation;
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", jsonText);
    throw new Error("The AI returned an invalid response format.");
  }
}

export async function evaluatePracticeAttempt(modelAnswer: string, userAnswer: string): Promise<PracticeEvaluation> {
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using mocked data for practice evaluation.");
     return new Promise(resolve => setTimeout(() => resolve({
      accuracy: 95,
      feedback: "Great job! Just a small typo on the word 'curiculum'. It should be 'curriculum'."
    }), 1000));
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `A user is practicing typing a model answer. Compare the user's attempt to the original model answer. Calculate an accuracy percentage and provide brief, encouraging feedback, noting any specific typos or differences.

Original Model Answer: "${modelAnswer}"

User's Typing Attempt: "${userAnswer}"
`,
    config: {
      systemInstruction: "You are a helpful assistant that checks for typing accuracy. Compare two texts and provide a percentage score and constructive feedback. Focus on exact matches, including punctuation and capitalization.",
      responseMimeType: "application/json",
      responseSchema: practiceEvaluationSchema,
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as PracticeEvaluation;
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", jsonText);
    throw new Error("The AI returned an invalid response format for the practice check.");
  }
}
