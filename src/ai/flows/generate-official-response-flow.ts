
'use server';
/**
 * @fileOverview Flow to generate an official response to a citizen's contribution.
 *
 * - generateOfficialResponse - A function that generates a professional and empathetic response.
 */

import {ai} from '@/ai/genkit';
import { GenerateOfficialResponseInput, GenerateOfficialResponseInputSchema, GenerateOfficialResponseOutput, GenerateOfficialResponseOutputSchema } from '@/lib/data';

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
