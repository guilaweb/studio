
'use server';
/**
 * @fileOverview Flow to calculate the priority of an incident.
 *
 * - calculateIncidentPriorityFlow - A function that uses AI to determine the priority of a new incident.
 */

import {ai} from '@/ai/genkit';
import { CalculateIncidentPriorityInputSchema, CalculateIncidentPriorityOutputSchema } from '@/lib/data';

export const calculateIncidentPriorityFlow = ai.defineFlow(
    {
        name: 'calculateIncidentPriorityFlow',
        inputSchema: CalculateIncidentPriorityInputSchema,
        outputSchema: CalculateIncidentPriorityOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);

const prompt = ai.definePrompt({
    name: 'calculateIncidentPriorityPrompt',
    input: { schema: CalculateIncidentPriorityInputSchema },
    output: { schema: CalculateIncidentPriorityOutputSchema },
    prompt: `
        You are a municipal operations analyst. Your task is to assess the priority of a new incident report based on its title and description.

        Analyze the provided incident details and determine its priority level. Consider the following:
        -   **High Priority:** Incidents that pose an immediate threat to life, health, or major infrastructure. Keywords: "grave", "urgente", "perigo", "fatal", "atropelamento", "colisão grave", "fogo", "inundação".
        -   **Medium Priority:** Incidents that cause significant disruption but are not immediately life-threatening. Keywords: "danificado", "defeito", "colisão ligeira", "semáforo", "iluminação", "obstrução", "buraco na via".
        -   **Low Priority:** Minor issues or routine maintenance.

        Based on your assessment of the text, classify the incident's priority as "low", "medium", or "high".

        Incident Title: {{{title}}}
        Incident Description: {{{description}}}
    `,
});
