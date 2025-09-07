
'use server';
/**
 * @fileOverview Flow to predict upcoming vehicle maintenance needs.
 * 
 * - predictMaintenanceFlow - A function that uses AI to analyze vehicle data and predict failures.
 */

import { ai } from '@/ai/genkit';
import { PredictMaintenanceInputSchema, PredictMaintenanceOutputSchema } from '@/lib/data';

const prompt = ai.definePrompt({
    name: 'predictMaintenancePrompt',
    input: { schema: PredictMaintenanceInputSchema },
    output: { schema: PredictMaintenanceOutputSchema },
    prompt: `
        You are a master automotive mechanic and fleet maintenance analyst. 
        Your task is to analyze data for a single vehicle and predict potential upcoming maintenance needs.

        Analyze the provided JSON data, which includes the vehicle's type, mileage, age, and recent driving events.
        Based on this data, predict up to three specific maintenance tasks that are likely to be required soon.

        For each prediction, you MUST provide:
        1.  **taskDescription**: A clear, concise description of the maintenance task (e.g., "Substituição da embraiagem", "Troca das pastilhas de travão dianteiras").
        2.  **reason**: A brief justification based on the provided data. Connect the data to the prediction. (e.g., "A quilometragem elevada e os eventos de aceleração brusca indicam desgaste acentuado da embraiagem.").
        3.  **priority**: The priority of the task ('low', 'medium', or 'high'). High priority should be for issues that could cause a breakdown or safety risk.

        **Example Analysis:**
        - A vehicle with high mileage and a history of "Travagem Brusca" events is a strong candidate for a "Troca das pastilhas de travão" prediction.
        - A "Carrinha de Manutenção" with high mileage might need a "Verificação do sistema de suspensão" due to carrying heavy loads.
        - Standard high-mileage tasks like "Troca da correia de distribuição" should be considered.

        If there is not enough data to make a confident prediction, return an empty list of predictions.

        Vehicle Data:
        "{{{json input}}}"
    `,
});

export const predictMaintenanceFlow = ai.defineFlow(
    {
        name: 'predictMaintenanceFlow',
        inputSchema: PredictMaintenanceInputSchema,
        outputSchema: PredictMaintenanceOutputSchema,
    },
    async (input) => {
        const { output } = await prompt({input});
        return output!;
    }
);
