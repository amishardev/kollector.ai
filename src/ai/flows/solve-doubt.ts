/**
 * @fileOverview An AI agent to solve doubts with explanation and generate follow-up MCQs.
 * This file defines a Genkit tool that can be used by other flows.
 *
 * - solveDoubtTool - A Genkit tool that provides a detailed explanation for a student's doubt and generates 3 MCQs.
 * - SolveDoubtWithExplanationAndMCQsInput - The input type for the tool.
 * - SolveDoubtWithExplanationAndMCQsOutput - The output schema for the tool.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SolveDoubtWithExplanationAndMCQsInputSchema = z.object({
  doubt: z.string().describe('The doubt or question submitted by the student.'),
  subject: z.string().describe('The subject of the doubt.'),
});
export type SolveDoubtWithExplanationAndMCQsInput = z.infer<typeof SolveDoubtWithExplanationAndMCQsInputSchema>;

export const SolveDoubtWithExplanationAndMCQsOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the answer to the doubt.'),
  mcqs: z.array(
    z.object({
      question: z.string().describe('A follow-up multiple-choice question.'),
      options: z.array(z.string()).describe('The options for the multiple-choice question.'),
      answer: z.string().describe('The correct answer for the multiple-choice question.'),
    })
  ).optional().describe('Follow-up multiple-choice questions related to the doubt. This may be omitted if not applicable.'),
});
export type SolveDoubtWithExplanationAndMCQsOutput = z.infer<typeof SolveDoubtWithExplanationAndMCQsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'solveDoubtWithExplanationAndMCQsPrompt',
  input: {schema: SolveDoubtWithExplanationAndMCQsInputSchema},
  output: {schema: SolveDoubtWithExplanationAndMCQsOutputSchema},
  prompt: `You are an expert tutor in {{{subject}}}.

Your task is to provide a detailed explanation for the student's doubt. If applicable, also create 3 multiple-choice questions (MCQs) to help them practice the concept.

Doubt:
"{{{doubt}}}"

For your response, you MUST provide a JSON object.
The JSON object must have an "explanation" field.
- The "explanation" field should contain a detailed, step-by-step explanation that clarifies the student's doubt.
- Optionally, you can include a "mcqs" field, which must be an array of 3 objects. If you do not create MCQs, omit this field.
  - Each object in the "mcqs" array represents a single MCQ and must contain "question", "options", and "answer" fields.
  - The "question" field is the text of the multiple-choice question.
  - The "options" field is an array of 4 strings, representing the choices for the question.
  - The "answer" field is the string that exactly matches the correct option from the "options" array.
`,
});

const solveDoubtWithExplanationAndMCQsFlow = ai.defineFlow(
  {
    name: 'solveDoubtWithExplanationAndMCQsFlow',
    inputSchema: SolveDoubtWithExplanationAndMCQsInputSchema,
    outputSchema: SolveDoubtWithExplanationAndMCQsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export const solveDoubtTool = ai.defineTool({
  name: 'solveDoubtTool',
  description: "Use this tool when a user asks an academic question or has a doubt about a specific subject based on text input. Do not use for simple greetings or casual conversation. The 'doubt' parameter should be the user's question, and the 'subject' parameter should be the subject context of the conversation.",
  inputSchema: SolveDoubtWithExplanationAndMCQsInputSchema,
  outputSchema: SolveDoubtWithExplanationAndMCQsOutputSchema
}, async (input) => {
  return await solveDoubtWithExplanationAndMCQsFlow(input);
});
