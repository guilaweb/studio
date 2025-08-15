
'use server';
/**
 * @fileOverview Flow to generate an official response to a citizen's contribution.
 *
 * - generateOfficialResponse - A function that generates a professional and empathetic response.
 * - GenerateOfficialResponseInput - The input type for the generateOfficialResponse function.
 * - GenerateOfficialResponseOutput - The return type for the generateOfficialResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOfficialResponseInputSchema = z.object({
  citizenContribution: z.string().describe("The citizen's contribution text."),
  projectName: z.string().describe("The name of the construction project."),
});
export type GenerateOfficialResponseInput = z.infer<typeof GenerateOfficialResponseInputSchema>;

const GenerateOfficialResponseOutputSchema = z.object({
  response: z.string().describe('The generated official response.'),
});
export type GenerateOfficialResponseOutput = z.infer<typeof GenerateOfficialResponseOutputSchema>;


export async function generateOfficialResponse(input: GenerateOfficialResponseInput): Promise<GenerateOfficialResponseOutput> {
    return generateOfficialResponseFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateOfficialResponsePrompt',
    input: { schema: GenerateOfficialResponseInputSchema },
    output: { schema: GenerateOfficialResponseOutputSchema },
    prompt: `
        You are a municipal communications assistant. Your task is to draft a professional, empathetic, and clear response to a citizen's contribution regarding a public construction project.

        The response should:
        1. Acknowledge and thank the citizen for their contribution.
        2. Address the specific point raised by the citizen.
        3. Be reassuring and demonstrate that the administration is aware and/or taking action.
        4. Maintain a formal and respectful tone.
        5. Be written in Portuguese (Portugal).

        Citizen's contribution about the project "{{projectName}}":
        "{{{citizenContribution}}}"

        Generate a suitable official response.
    `,
});

const generateOfficialResponseFlow = ai.defineFlow(
    {
        name: 'generateOfficialResponseFlow',
        inputSchema: GenerateOfficialResponseInputSchema,
        outputSchema: GenerateOfficialResponseOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
