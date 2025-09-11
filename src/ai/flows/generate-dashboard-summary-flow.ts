
'use server';
/**
 * @fileOverview Flow to generate a dashboard summary.
 *
 * - generateDashboardSummary - A function that generates an executive summary for the dashboard.
 */

import {ai} from '@/ai/genkit';
import { GenerateDashboardSummaryInput, GenerateDashboardSummaryInputSchema, GenerateDashboardSummaryOutput, GenerateDashboardSummaryOutputSchema, DashboardStatsSchema } from '@/lib/data';


export async function generateDashboardSummary(input: GenerateDashboardSummaryInput): Promise<GenerateDashboardSummaryOutput> {
    return generateDashboardSummaryFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateDashboardSummaryPrompt',
    input: { schema: GenerateDashboardSummaryInputSchema },
    output: { schema: GenerateDashboardSummaryOutputSchema },
    prompt: `
        You are a municipal operations analyst AI. Your task is to provide a concise executive summary for the city manager's dashboard based on the provided statistical data.
        The summary must be in Portuguese (Portugal).

        Analyze the provided JSON data and use it to write a professional, data-driven summary.
        - Start with a general overview.
        - Highlight the number of new incidents in the last 24 hours.
        - Comment on any significant incident clusters detected.
        - Mention the sanitation status, including the resolution rate and number of full containers.
        - Briefly touch on citizen engagement regarding construction projects.

        Be concise and synthesize the information into a clear narrative about the city's operational status.

        Statistical Data:
        "{{{json stats}}}"
    `,
});

const generateDashboardSummaryFlow = ai.defineFlow(
    {
        name: 'generateDashboardSummaryFlow',
        inputSchema: GenerateDashboardSummaryInputSchema,
        outputSchema: GenerateDashboardSummaryOutputSchema,
    },
    async (input) => {
        const { output } = await prompt({stats: input.stats});
        return output!;
    }
);
