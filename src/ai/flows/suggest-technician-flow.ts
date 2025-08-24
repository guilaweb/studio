
'use server';
/**
 * @fileOverview Flow to suggest the best technician for a given task.
 * 
 * - suggestTechnicianFlow - A function that uses AI to rank technicians based on multiple criteria.
 */

import { ai } from '@/ai/genkit';
import { SuggestTechnicianInputSchema, SuggestTechnicianOutputSchema } from '@/lib/data';
import { z } from 'zod';

const prompt = ai.definePrompt({
    name: 'suggestTechnicianPrompt',
    input: { schema: SuggestTechnicianInputSchema },
    output: { schema: SuggestTechnicianOutputSchema },
    prompt: `
        You are an expert logistics and dispatch coordinator for a municipal services company.
        Your task is to analyze a new task and a list of available field technicians to recommend the best candidates for the job.

        You must return a ranked list of the top 3 technicians.

        **Primary Ranking Criteria (in order of importance):**
        1.  **Availability:** Technicians with status 'Disponível' are the only ones eligible. Filter out all others immediately.
        2.  **Proximity:** Technicians closer to the task location are strongly preferred. Calculate the straight-line distance.
        3.  **Workload:** Technicians with a smaller 'taskQueueSize' are preferred as they can respond faster.

        **Secondary Criteria:**
        -   **Skills:** (If provided) Ensure the technician has the required skills for the task.

        **Output Requirements:**
        -   Provide a ranked list of up to 3 suggestions.
        -   For each suggestion, include the 'technicianId', its 'rank' (1, 2, 3), and a brief 'reason' for your choice, mentioning at least two criteria (e.g., "Mais próximo e com a menor fila de espera.").

        **Input Data:**

        New Task:
        "{{{json task}}}"

        Available Technicians:
        "{{{json technicians}}}"
    `,
});

export const suggestTechnicianFlow = ai.defineFlow(
    {
        name: 'suggestTechnicianFlow',
        inputSchema: SuggestTechnicianInputSchema,
        outputSchema: SuggestTechnicianOutputSchema,
    },
    async (input) => {
        // Filter for available technicians before sending to the model for efficiency
        const availableTechnicians = input.technicians.filter(t => t.status === 'Disponível');
        
        if (availableTechnicians.length === 0) {
            return { suggestions: [] };
        }

        const { output } = await prompt({ ...input, technicians: availableTechnicians });
        return output!;
    }
);
