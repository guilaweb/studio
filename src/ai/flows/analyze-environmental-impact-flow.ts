
'use server';
/**
 * @fileOverview Flow to analyze the environmental impact of a construction project.
 * 
 * - analyzeEnvironmentalImpactFlow - A function that uses AI to provide sustainability suggestions.
 */

import { ai } from '@/ai/genkit';
import { AnalyzeEnvironmentalImpactInputSchema, AnalyzeEnvironmentalImpactOutputSchema } from '@/lib/data';
import { z } from 'zod';

const prompt = ai.definePrompt({
    name: 'analyzeEnvironmentalImpactPrompt',
    input: { schema: AnalyzeEnvironmentalImpactInputSchema },
    output: { schema: AnalyzeEnvironmentalImpactOutputSchema },
    prompt: `
        You are an expert urban planner specializing in sustainable and ecological design for a municipality. 
        Your task is to perform a preliminary environmental impact and sustainability analysis for a new construction or land development project.

        Analyze the project description and data to provide actionable, high-level feedback in three key areas: Drainage, Heat Island Effect, and Energy Efficiency.
        Your feedback must be in Portuguese (Portugal).

        **Analysis Rules:**
        1.  **Drainage and Water Management:** Look for keywords like "drenagem", "água", "chuva", "permeável". If the description lacks detail, suggest best practices like "Considerar o uso de pavimentos permeáveis para reduzir o escoamento superficial" or "Integrar bacias de retenção ou jardins de chuva para gerir as águas pluviais."
        2.  **Heat Island Effect:** Look for keywords like "asfalto", "betão", "sombra", "árvores", "espaços verdes". If the project involves large paved areas, recommend "Aumentar a cobertura arbórea e as áreas verdes para criar sombra e arrefecer o ambiente." or "Utilizar materiais de cobertura com alto albedo (refletividade) para mitigar o efeito de ilha de calor."
        3.  **Energy Efficiency and Ventilation:** Look for keywords like "orientação solar", "ventilação natural", "eficiência energética", "painéis solares". If not mentioned, provide general advice like "Estudar a orientação dos edifícios para otimizar a luz solar passiva no inverno e minimizar o ganho de calor no verão." or "Promover a ventilação cruzada natural para reduzir a necessidade de ar condicionado."

        Provide a concise, professional summary for each of the three output fields.

        Project Data:
        - Project Type: {{{projectType}}}
        - Project Area: {{{area}}} m²
        - Project Description: "{{{projectDescription}}}"
    `,
});

export const analyzeEnvironmentalImpactFlow = ai.defineFlow(
    {
        name: 'analyzeEnvironmentalImpactFlow',
        inputSchema: AnalyzeEnvironmentalImpactInputSchema,
        outputSchema: AnalyzeEnvironmentalImpactOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
