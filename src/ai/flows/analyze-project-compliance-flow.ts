
'use server';
/**
 * @fileOverview Flow to analyze the compliance of a construction project against zoning regulations.
 * 
 * - analyzeProjectComplianceFlow - A function that uses AI to check for potential non-compliance.
 */

import { ai } from '@/ai/genkit';
import { AnalyzeProjectComplianceInput, AnalyzeProjectComplianceInputSchema, AnalyzeProjectComplianceOutput, AnalyzeProjectComplianceOutputSchema } from '@/lib/data';

const prompt = ai.definePrompt({
    name: 'analyzeProjectCompliancePrompt',
    input: { schema: AnalyzeProjectComplianceInputSchema },
    output: { schema: AnalyzeProjectComplianceOutputSchema },
    prompt: `
        You are an expert urban planning and zoning analyst for a municipality in Angola. 
        Your task is to perform a preliminary compliance check for a new construction project based on the provided project details and the zoning regulations for the specific land plot.

        Analyze the project information and compare it against the zoning data. Your goal is to identify any clear or potential conflicts with the established regulations.

        Consider the following rules for your analysis:
        1.  **Usage Type:** Does the project's description and type (e.g., 'remodel', 'new build') align with the permitted usage ('usageType') for the plot (e.g., 'residential', 'commercial')? A new commercial build on a 'residential' plot is a clear conflict. A remodel of an existing house on a residential plot is compliant.
        2.  **Implicit Information from Description:** Use the project description to infer details. For example, a description containing "prédio de 5 andares" conflicts with a 'maxHeight' of 4. A description with "uma ocupação de 75%" conflicts with a 'buildingRatio' of 60.
        3.  **General Regulations:** Check the project description against the 'zoningInfo' field, which may contain specific rules like setbacks, architectural styles, or other restrictions.
        4.  **Be Conservative:** If the information is insufficient to make a clear determination for a specific rule, assume it's compliant for that rule but mention the lack of data in the analysis. If you find at least one clear conflict, the overall result is non-compliant.

        Based on your analysis:
        -   Set 'isCompliant' to 'true' if the project appears to fully comply with all provided regulations.
        -   Set 'isCompliant' to 'false' if you identify at least one clear or highly potential conflict.
        -   In the 'analysis' field, provide a concise, professional summary of your findings in Portuguese (Portugal). If it is compliant, state that and mention a key aspect (e.g., "Projeto parece estar em conformidade com o uso residencial permitido e os limites de altura."). If non-compliant, clearly state the main reason (e.g., "Potencial conflito: A altura do projeto (5 pisos) excede o limite de 4 pisos permitido para o lote.").

        Project Data:
        - Project Type: {{{projectType}}}
        - Project Description: "{{{projectDescription}}}"

        Zoning Regulations for the Plot:
        "{{{json plotZoning}}}"
    `,
});

export const analyzeProjectComplianceFlow = ai.defineFlow(
    {
        name: 'analyzeProjectComplianceFlow',
        inputSchema: AnalyzeProjectComplianceInputSchema,
        outputSchema: AnalyzeProjectComplianceOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
