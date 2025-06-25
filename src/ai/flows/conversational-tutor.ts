'use server';
/**
 * @fileOverview A conversational AI tutor that can handle both casual conversation and academic doubts.
 *
 * - conversationalTutor - The main function that processes user input.
 * - ConversationalTutorInput - The input type for the function.
 * - ConversationalTutorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConversationalTutorInputSchema = z.object({
  prompt: z.string().describe("The user's message or question."),
  subject: z.string().describe('The subject context for the conversation.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of a question, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ConversationalTutorInput = z.infer<
  typeof ConversationalTutorInputSchema
>;

const MCQSchema = z
  .array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      answer: z.string(),
    })
  )
  .optional();

const ConversationalTutorOutputSchema = z.object({
  response: z.string(),
  mcqs: MCQSchema,
});
export type ConversationalTutorOutput = z.infer<
  typeof ConversationalTutorOutputSchema
>;

// This is the new internal schema for the consolidated flow
const ConsolidatedTutorOutputSchema = z.object({
  responseType: z
    .enum(['conversation', 'doubt_explanation', 'perspective_explanation'])
    .describe(
      'Indicates whether the response is a simple conversation, a doubt explanation, or a perspective-based explanation.'
    ),
  text: z
    .string()
    .optional()
    .describe(
      "The AI's response for conversational parts. Only present if responseType is 'conversation'."
    ),
  explanation: z
    .string()
    .optional()
    .describe(
      "The detailed explanation for a doubt or a perspective-based question. Present if responseType is 'doubt_explanation' or 'perspective_explanation'."
    ),
  mcqs: MCQSchema.describe(
    "Follow-up MCQs. Only present if responseType is 'doubt_explanation' and they are applicable."
  ),
  quizMessage: z
    .string()
    .optional()
    .describe(
      "A message to introduce the quiz, in the detected language. For example: 'I've also created a little quiz for you...'"
    ),
});

const prompt = ai.definePrompt({
  name: 'consolidatedTutorPrompt',
  input: { schema: ConversationalTutorInputSchema },
  output: { schema: ConsolidatedTutorOutputSchema },
  prompt: `You are a friendly and helpful AI tutor for the subject: {{subject}}. Your name is kollector.ai.
Your primary goal is to analyze the user's input and determine if it's casual conversation, a factual question, or a subjective question requiring a nuanced perspective.

**Language Detection:** You must detect the language of the user's input. Your response, including explanations, MCQs, and any other text, MUST be in the same language as the user's prompt (English, Hindi, or Hinglish).

Based on the input, you MUST respond with a JSON object that adheres to the provided schema.

1.  **If the user provides a greeting, asks a simple question (e.g., "how are you?"), or engages in casual conversation:**
    - Set the 'responseType' field to 'conversation'.
    - Provide a natural, conversational response in the 'text' field.
    - Omit 'explanation', 'mcqs', and 'quizMessage'.

2.  **If the user asks a specific academic question or expresses a doubt (either with text or an image) that has a factual answer:**
    - Set the 'responseType' to 'doubt_explanation'.
    - Provide a detailed, step-by-step explanation in the 'explanation' field, in the detected language.
    - If applicable, create 3 multiple-choice questions (MCQs) in the 'mcqs' field to help the user practice the concept. All parts of the MCQ (question, options, answer) must be in the detected language. If MCQs are not applicable, omit this field.
    - If you created MCQs, provide a short, encouraging message in the 'quizMessage' field to introduce them, in the detected language (e.g., "I've also created a little quiz for you to test your knowledge.").
    - Omit the 'text' field.

3.  **If the user asks a subjective, open-ended question that requires a nuanced, perspective-based answer (e.g., "Was Oppenheimer a good person?", "Discuss the ethics of AI"):**
    - Set the 'responseType' to 'perspective_explanation'.
    - Provide a balanced and multi-faceted explanation in the 'explanation' field. Explore different viewpoints and acknowledge the complexity of the topic. Avoid taking a single, definitive stance.
    - Omit 'mcqs' and 'quizMessage'.
    - Omit the 'text' field.

User's input: "{{prompt}}"
{{#if photoDataUri}}
User's image: {{media url=photoDataUri}}
{{/if}}
`,
});

const consolidatedTutorFlow = ai.defineFlow(
  {
    name: 'consolidatedTutorFlow',
    inputSchema: ConversationalTutorInputSchema,
    outputSchema: ConsolidatedTutorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

// This wrapper function maintains the public API contract with actions.ts
export async function conversationalTutor(
  input: ConversationalTutorInput
): Promise<ConversationalTutorOutput> {
  const result = await consolidatedTutorFlow(input);

  if (result.responseType === 'conversation' && result.text) {
    return {
      response: result.text,
      mcqs: undefined,
    };
  }

  if (
    (result.responseType === 'doubt_explanation' ||
      result.responseType === 'perspective_explanation') &&
    result.explanation
  ) {
    let responseText = result.explanation;
    if (result.quizMessage) {
      responseText += `\n\n${result.quizMessage}`;
    }
    return {
      response: responseText,
      mcqs: result.mcqs,
    };
  }

  // Fallback if the AI returns an unexpected structure
  return {
    response:
      "I'm sorry, I couldn't process that request. Could you try rephrasing it?",
    mcqs: undefined,
  };
}
