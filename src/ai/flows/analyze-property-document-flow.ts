
'use server';
/**
 * @fileOverview Flow to analyze a property document using AI.
 * 
 * - analyzePropertyDocument - A function that uses AI to extract key information from a property document.
 */

import { ai } from '@/ai/genkit';
import { AnalyzePropertyDocumentInputSchema, AnalyzePropertyDocumentOutputSchema } from '@/lib/data';

const prompt = ai.definePrompt({
    name: 'analyzePropertyDocumentPrompt',
    input: { schema: AnalyzePropertyDocumentInputSchema },
    output: { schema: AnalyzePropertyDocumentOutputSchema },
    prompt: `
        You are an expert land registry analyst. Your task is to analyze the provided image of a property document (e.g., Title of Concession, Land Registry Certificate, Purchase Agreement) and extract key information.
        The document is in Portuguese. All your outputs must also be in Portuguese.

        **Analysis Rules:**
        1.  **Extract Information:** Carefully read the document and extract the following fields:
            *   'ownerName': The full name of the property owner or rights holder.
            *   'registrationNumber': The official registration number of the property or plot (e.g., "Nº de Registo Predial", "Matrícula").
            *   'plotArea': The total area of the plot in square meters. If specified, extract the numeric value.
            *   'summary': Provide a very brief, one-sentence summary of the document's nature (e.g., "Título de Concessão de terreno para habitação.", "Contrato de compra e venda de um lote.").

        2.  **Assess Confidence:**
            *   'confidenceScore': Based on the visual quality, clarity, and apparent formality of the document (stamps, signatures, official letterhead), provide a confidence score from 0 to 100 on its likely authenticity. A blurry, handwritten note has low confidence. A clear, stamped, official document has high confidence.
            *   'redFlags': List any potential issues or "red flags" you observe. Examples: "Rasuras visíveis na área do lote.", "Falta de carimbo oficial.", "Documento parece ser uma fotocópia de má qualidade.", "Data do documento é muito antiga.". If no red flags, return an empty array.

        **Input Document:**
        {{media url=documentDataUri}}
    `,
});

export const analyzePropertyDocumentFlow = ai.defineFlow(
    {
        name: 'analyzePropertyDocumentFlow',
        inputSchema: AnalyzePropertyDocumentInputSchema,
        outputSchema: AnalyzePropertyDocumentOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
