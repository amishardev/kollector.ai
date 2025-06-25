/**
 * @fileOverview An AI agent that solves doubts from an image and generates follow-up MCQs.
 * This file defines a Genkit tool that can be used by other flows.
 *
 * - solveDoubtWithImageTool - A Genkit tool that handles the doubt solving process from an image.
 * - SolveDoubtWithImageInput - The input type for the tool.
 * - SolveDoubtWithImageOutput - The return type for the tool.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SolveDoubtWithImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  subject: z.string().describe('The subject of the doubt.'),
  prompt: z.string().optional().describe('Optional text from the user providing context for the image.'),
});
export type SolveDoubtWithImageInput = z.infer<typeof SolveDoubtWithImageInputSchema>;

export const SolveDoubtWithImageOutputSchema = z.object({
  explanation: z.string().describe('The detailed explanation of the solution.'),
  mcqs: z.array(
    z.object({
      question: z.string().describe('A follow-up multiple-choice question.'),
      options: z.array(z.string()).describe('The options for the multiple-choice question.'),
      answer: z.string().describe('The correct answer for the multiple-choice question.'),
    })
  ).optional().describe('Follow-up multiple-choice questions related to the doubt. This may be omitted if not applicable.'),
});
export type SolveDoubtWithImageOutput = z.infer<typeof SolveDoubtWithImageOutputSchema>;

const prompt = ai.definePrompt({
  name: 'solveDoubtWithImagePrompt',
  input: {schema: SolveDoubtWithImageInputSchema},
  output: {schema: SolveDoubtWithImageOutputSchema},
  prompt: `You are an expert in {{subject}}.

Your task is to analyze the provided image, understand the question it contains, provide a detailed explanation. If applicable, also create 3 multiple-choice questions (MCQs) to help the user practice the concept.

Image of the question: {{media url=photoDataUri}}
{{#if prompt}}
Additional context from the user: "{{{prompt}}}"
{{/if}}

For your response, you MUST provide a JSON object.
The JSON object must have an "explanation" field.
- The "explanation" field should contain a detailed, step-by-step explanation that solves or clarifies the question in the image.
- Optionally, you can include a "mcqs" field, which must be an array of 3 objects. If you do not create MCQs, omit this field.
  - Each object in the "mcqs" array represents a single MCQ and must contain "question", "options", and "answer" fields.
  - The "question" field is the text of the multiple-choice question.
  - The "options" field is an array of 4 strings, representing the choices for the question.
  - The "answer" field is the string that exactly matches the correct option from the "options" array.
`,
});

const solveDoubtWithImageFlow = ai.defineFlow(
  {
    name: 'solveDoubtWithImageFlow',
    inputSchema: SolveDoubtWithImageInputSchema,
    outputSchema: SolveDoubtWithImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export const solveDoubtWithImageTool = ai.defineTool({
    name: 'solveDoubtWithImageTool',
    description: "Use this tool when a user uploads an image and asks an academic question or has a doubt about a specific subject. The 'photoDataUri' is required. The 'subject' parameter should be the subject context of the conversation. The 'prompt' parameter should be the user's text input, if any.",
    inputSchema: SolveDoubtWithImageInputSchema,
    outputSchema: SolveDoubtWithImageOutputSchema
}, async (input) => {
    return await solveDoubtWithImageFlow(input);
});
