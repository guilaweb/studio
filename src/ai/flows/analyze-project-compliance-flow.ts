
'use server';
/**
 * @fileOverview Flow to analyze the compliance and infrastructure risk of a construction project.
 * 
 * - analyzeProjectComplianceFlow - A function that uses AI to check for potential non-compliance and infrastructure conflicts.
 */

import { ai } from '@/ai/genkit';
import { AnalyzeProjectComplianceInput, AnalyzeProjectComplianceInputSchema, AnalyzeProjectComplianceOutput, AnalyzeProjectComplianceOutputSchema } from '@/lib/data';

const prompt = ai.definePrompt({
    name: 'analyzeProjectCompliancePrompt',
    input: { schema: AnalyzeProjectComplianceInputSchema },
    output: { schema: AnalyzeProjectComplianceOutputSchema },
    prompt: `
        You are an expert urban planning and zoning analyst for a municipality, with a secondary specialization in infrastructure risk assessment. 
        Your task is to perform a preliminary compliance and risk check for a new construction project.

        Your analysis must cover two areas:
        1.  **Zoning Compliance:** Compare the project against the zoning regulations for the plot.
        2.  **Infrastructure Risk:** Identify potential conflicts with subterranean infrastructure based on the project description.

        **Analysis Rules:**

        **Part 1: Zoning Compliance**
        1.  **Usage Type:** Does the project's description align with the permitted usage ('usageType') for the plot (e.g., 'commercial' vs. 'residential')?
        2.  **Implicit Information:** Infer details from the description. "Prédio de 5 andares" conflicts with a 'maxHeight' of 4. "Ocupação de 75%" conflicts with a 'buildingRatio' of 60.
        3.  **General Regulations:** Check the description against the 'zoningInfo' field for specific rules.
        4.  **Conservative Approach:** If information is insufficient, assume compliance for that rule but mention it.

        **Part 2: Infrastructure Risk (Simulated "Before You Dig")**
        1.  **Keyword Detection:** Scrutinize the project description for keywords related to ground intervention, such as "escavação", "fundação", "cave", "subsolo", "estacas", "infraestrutura subterrânea".
        2.  **Risk Inference:** If such keywords are present, assume a potential conflict with underground networks (water, electricity, fiber optics) is possible. This is a preliminary warning.
        3.  **Risk Flagging:** If a potential infrastructure risk is detected, prepend the main analysis text with a clear, separate warning.

        **Output Generation:**
        -   Set 'isCompliant' to 'true' only if NO conflicts (zoning or infrastructure risk) are found.
        -   Set 'isCompliant' to 'false' if you identify at least one clear zoning conflict OR a potential infrastructure risk.
        -   In the 'analysis' field, provide a concise, professional summary in Portuguese (Portugal).
        -   If an infrastructure risk is found, the analysis MUST begin with: "**Alerta de Infraestrutura:** O seu projeto menciona trabalhos de escavação. É obrigatória a consulta prévia às concessionárias (EPAL, ENDE, etc.) para obter as plantas das redes subterrâneas antes de iniciar qualquer obra no solo.\\n\\n"
        -   Following the alert (if any), provide the zoning analysis. Example: "Projeto parece estar em conformidade com o uso residencial..." or "Potencial conflito: A altura do projeto (5 pisos) excede o limite de 4 pisos..."

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
