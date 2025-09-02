

'use server';
/**
 * @fileOverview Flow to suggest next steps for a construction project approval process.
 * 
 * - suggestNextSteps - A function that suggests required departmental reviews based on project details.
 */

import { ai } from '@/ai/genkit';
import { SuggestNextStepsInput, SuggestNextStepsInputSchema, SuggestNextStepsOutput, SuggestNextStepsOutputSchema } from '@/lib/data';

export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
    return suggestNextStepsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestNextStepsPrompt',
    input: { schema: SuggestNextStepsInputSchema },
    output: { schema: SuggestNextStepsOutputSchema },
    prompt: `
        You are a workflow engine for a municipal administration. 
        Your task is to analyze a construction project and determine which departments need to provide a review (parecer) before the project can be approved.

        Analyze the project details provided. Based on the rules below, create a list of required steps.
        For each step, specify the department, the reason for the review, and set the initial status to "pending".
        Each step must also have a unique 'id'.

        **Crucially, the 'reason' for each step must be in Portuguese (Portugal).**

        Workflow Rules:
        1.  **Bombeiros (Fire Department):** Required for any project that is 'commercial' or 'industrial', or if the description mentions "público", "multidão", "hotel", "hospital", "escola", "inflamável" or "risco de incêndio".
        2.  **Ambiente (Environmental Department):** Required for any 'industrial' project. Also required if the description mentions "impacto ambiental", "área protegida", "desmatamento", "recursos hídricos", or "poluição".
        3.  **Engenharia de Tráfego (Traffic Engineering):** Required if the description mentions "tráfego", "estacionamento", "congestionamento", "acesso viário", or if it is a large-scale project (e.g., "shopping", "condomínio grande").
        4.  **Engenharia Estrutural (Structural Engineering):** Required for any 'new-build' or 'expansion' project that is more than 2 stories high (e.g., "prédio de 3 andares", "edifício de 5 pisos"). Also required if the description mentions "ponte", "viaduto", or "estrutura complexa".
        5.  **Património Histórico (Historical Heritage):** Required if the description mentions "edifício histórico", "património", "zona histórica", or "classificado".

        If no special reviews are needed based on these rules, return an empty list of steps.

        Project Details:
        - Project Type: {{{projectType}}}
        - Usage Type: {{{usageType}}}
        - Description: "{{{projectDescription}}}"
    `,
});

const suggestNextStepsFlow = ai.defineFlow(
    {
        name: 'suggestNextStepsFlow',
        inputSchema: SuggestNextStepsInputSchema,
        outputSchema: SuggestNextStepsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        
        // Ensure each step has a unique ID, as the model might forget.
        if (output && output.steps) {
            output.steps = output.steps.map((step, index) => ({
                ...step,
                id: `step-${Date.now()}-${index}`
            }));
        }
        
        return output!;
    }
);
