
'use server';
/**
 * @fileOverview Flow to detect duplicate incidents.
 * 
 * - detectDuplicate - A function that checks if a new incident is a duplicate of an existing one.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DetectDuplicateInputSchema, DetectDuplicateOutputSchema, DetectDuplicateInput, DetectDuplicateOutput } from '@/lib/data';


export async function detectDuplicate(input: DetectDuplicateInput): Promise<DetectDuplicateOutput> {
    if (input.existingIncidents.length === 0) {
        return { isDuplicate: false };
    }
    return detectDuplicateFlow(input);
}


const prompt = ai.definePrompt({
    name: 'detectDuplicatePrompt',
    input: { schema: DetectDuplicateInputSchema },
    output: { schema: DetectDuplicateOutputSchema },
    prompt: `
        You are a municipal operations analyst. Your task is to determine if a new incident report is a duplicate of an existing one.

        Analyze the new incident report and compare it against the list of existing incidents.
        
        A report is a duplicate if it refers to the same real-world event or issue. Consider the following:
        1.  **Location:** Are the coordinates very close (e.g., within a few hundred meters)?
        2.  **Semantics:** Do the titles and descriptions describe the same problem, even if they use different words? (e.g., "car crash" vs. "vehicle collision", "broken traffic light" vs. "signal not working").
        3.  **Time:** The existing incidents provided are recent.

        If you find a clear duplicate, set "isDuplicate" to true and provide the "id" of the *most likely* original incident in "duplicateOfId".
        
        If the new incident seems unique or if you are uncertain, set "isDuplicate" to false.

        New Incident Data:
        "{{{json newIncident}}}"

        Existing Incidents Data:
        "{{{json existingIncidents}}}"
    `,
});

const detectDuplicateFlow = ai.defineFlow(
    {
        name: 'detectDuplicateFlow',
        inputSchema: DetectDuplicateInputSchema,
        outputSchema: DetectDuplicateOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
