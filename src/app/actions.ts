"use server";

import { conversationalTutor, ConversationalTutorOutput } from '@/ai/flows/conversational-tutor';
import { explainMCQ, ExplainMCQOutput } from '@/ai/flows/tutor-mcq';

export async function handleUserMessage(
  prompt: string,
  subject: string,
  photoDataUri?: string
): Promise<ConversationalTutorOutput> {
  const result = await conversationalTutor({ prompt, subject, photoDataUri });
  return result;
}

export async function getMCQExplanation(
  question: string,
  options: string[],
  correctAnswer: string,
  subject: string
): Promise<ExplainMCQOutput> {
  const correctAnswerIndex = options.findIndex((opt) => opt === correctAnswer);
  if (correctAnswerIndex === -1) {
    return { explanation: "Couldn't find the correct answer in the options." };
  }
  const result = await explainMCQ({
    question,
    options,
    correctAnswerIndex,
    subject,
  });
  return result;
}
