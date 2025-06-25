// src/ai/flows/tutor-mcq.ts
'use server';

/**
 * @fileOverview Generates an explanation for the correct answer of an MCQ.
 *
 * - explainMCQ - A function that generates the explanation.
 * - ExplainMCQInput - The input type for the explainMCQ function.
 * - ExplainMCQOutput - The return type for the explainMCQ function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainMCQInputSchema = z.object({
  question: z.string().describe('The text of the multiple choice question.'),
  options: z.array(z.string()).describe('The options for the multiple choice question.'),
  correctAnswerIndex: z.number().describe('The index of the correct answer in the options array.'),
  subject: z.string().describe('The subject of the multiple choice question.'),
});
export type ExplainMCQInput = z.infer<typeof ExplainMCQInputSchema>;

const ExplainMCQOutputSchema = z.object({
  explanation: z.string().describe('The explanation of why the correct answer is correct.'),
});
export type ExplainMCQOutput = z.infer<typeof ExplainMCQOutputSchema>;

export async function explainMCQ(input: ExplainMCQInput): Promise<ExplainMCQOutput> {
  return explainMCQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainMCQPrompt',
  input: {schema: ExplainMCQInputSchema},
  output: {schema: ExplainMCQOutputSchema},
  prompt: `You are an expert tutor in {{{subject}}}. Your task is to explain why the provided answer to a multiple-choice question is correct.

**Language Detection:** Analyze the language of the question and options provided. Your explanation MUST be in the same language (English, Hindi, or Hinglish).

The user was presented with the following question:
Question: "{{{question}}}"

These were the options:
{{#each options}}
- {{{this}}}
{{/each}}

The correct answer is: "{{{options.[correctAnswerIndex]}}}"

Provide a clear and concise explanation for why this answer is correct. Respond with a JSON object containing a single key "explanation".`,
});

const explainMCQFlow = ai.defineFlow(
  {
    name: 'explainMCQFlow',
    inputSchema: ExplainMCQInputSchema,
    outputSchema: ExplainMCQOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
