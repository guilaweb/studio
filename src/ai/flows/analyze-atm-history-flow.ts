
'use server';
/**
 * @fileOverview Flow to analyze the history of an ATM's community reports.
 * 
 * - analyzeAtmHistoryFlow - A function that uses AI to provide intelligent summaries about an ATM.
 */

import { ai } from '@/ai/genkit';
import { AnalyzeAtmHistoryInputSchema, AnalyzeAtmHistoryOutput, AnalyzeAtmHistoryOutputSchema } from '@/lib/data';
import { z } from 'zod';

const prompt = ai.definePrompt({
    name: 'analyzeAtmHistoryPrompt',
    input: { schema: AnalyzeAtmHistoryInputSchema },
    output: { schema: AnalyzeAtmHistoryOutputSchema },
    prompt: `
        You are an expert data analyst for a community-driven platform that tracks ATM availability.
        Your task is to analyze a timeline of user reports for a single ATM and provide concise, helpful summaries in Portuguese (Portugal).

        Analyze the provided JSON data of updates and generate insights for the following three fields:
        1.  **availableNotesSummary**: Based on the 'availableNotes' arrays in the updates, identify the most frequently reported banknotes. If no data is available, state that there is no information.
            - Example: "As notas mais comuns são 2000 Kz e 5000 Kz." or "Ainda não há informação sobre as notas disponíveis."

        2.  **queuePatternSummary**: Based on the 'queueTime' values and the 'timestamp' of the reports, identify any patterns. Look for times of day when queues are longer.
            - Example: "As filas tendem a ser mais longas ao final da tarde." or "Não foram detetados padrões de fila significativos."

        3.  **restockPatternSummary**: This is the most complex. Infer when the ATM is likely restocked. A restock is likely to have occurred when the status changes from a series of 'unavailable' reports to a series of 'available' reports. Look for the day of the week and time of day this transition most often happens.
            - Example: "O ATM parece ser reabastecido com frequência às terças e sextas-feiras de manhã." or "Não há dados suficientes para estimar o padrão de reabastecimento."
        
        If there is not enough data for a particular analysis, provide a neutral, informative message saying so.

        **IMPORTANT**: Provide a concrete analysis for 'restockPatternSummary'. Do not say it's under development. Analyze the transitions from 'unavailable' to 'available' in the data.

        ATM Update History:
        "{{{json updates}}}"
    `,
});

export const analyzeAtmHistoryFlow = ai.defineFlow(
    {
        name: 'analyzeAtmHistoryFlow',
        inputSchema: AnalyzeAtmHistoryInputSchema,
        outputSchema: AnalyzeAtmHistoryOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
