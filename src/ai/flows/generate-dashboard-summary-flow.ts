
'use server';
/**
 * @fileOverview Flow to generate a dashboard summary.
 *
 * - generateDashboardSummary - A function that generates an executive summary for the dashboard.
 * - GenerateDashboardSummaryInput - The input type for the generateDashboardSummary function.
 * - GenerateDashboardSummaryOutput - The return type for the generateDashboardSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PointOfInterestUpdateSchema = z.object({
    id: z.string(),
    text: z.string(),
    authorId: z.string(),
    timestamp: z.string(),
    photoDataUri: z.string().optional(),
});

const PointOfInterestSchema = z.object({
    id: z.string(),
    type: z.enum(['atm', 'construction', 'incident', 'sanitation']),
    position: z.object({ lat: z.number(), lng: z.number() }),
    title: z.string(),
    description: z.string(),
    status: z.enum(['available', 'unavailable', 'unknown', 'full', 'damaged', 'collected', 'in_progress']).optional(),
    lastReported: z.string().optional(),
    authorId: z.string().optional(),
    updates: z.array(PointOfInterestUpdateSchema).optional(),
});

const GenerateDashboardSummaryInputSchema = z.object({
  pointsOfInterest: z.array(PointOfInterestSchema),
  currentDate: z.string().describe("The current date and time in ISO format, for context."),
});
export type GenerateDashboardSummaryInput = z.infer<typeof GenerateDashboardSummaryInputSchema>;

const GenerateDashboardSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated executive summary, in plain text. Should be concise and informative.'),
});
export type GenerateDashboardSummaryOutput = z.infer<typeof GenerateDashboardSummaryOutputSchema>;


export async function generateDashboardSummary(input: GenerateDashboardSummaryInput): Promise<GenerateDashboardSummaryOutput> {
    return generateDashboardSummaryFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateDashboardSummaryPrompt',
    input: { schema: GenerateDashboardSummaryInputSchema },
    output: { schema: GenerateDashboardSummaryOutputSchema },
    prompt: `
        You are a municipal operations analyst AI. Your task is to provide a concise executive summary for the city manager's dashboard based on the provided data.
        The summary must be in Portuguese (Portugal).

        Focus on events from the last 24 hours relative to the current date: {{currentDate}}.

        Analyze the provided JSON data of points of interest and identify:
        1.  **New Incidents:** Mention the number of new incidents and highlight any significant trends (e.g., a specific type of incident, a location).
        2.  **Incident Clusters:** Mention if any significant incident clusters have been detected.
        3.  **Sanitation Status:** Comment on the general status of sanitation points (e.g., number of full containers, resolution rate).
        4.  **Citizen Engagement:** Highlight any new citizen contributions or updates on construction projects.

        Be concise, professional, and data-driven. Provide a clear, high-level overview of the city's operational status. Do not list every single point. Synthesize the information.

        Data:
        "{{{json pointsOfInterest}}}"

        Generate a suitable executive summary.
    `,
});

const generateDashboardSummaryFlow = ai.defineFlow(
    {
        name: 'generateDashboardSummaryFlow',
        inputSchema: GenerateDashboardSummaryInputSchema,
        outputSchema: GenerateDashboardSummaryOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
