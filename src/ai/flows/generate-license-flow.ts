
'use server';
/**
 * @fileOverview Flow to generate a digital construction license.
 * 
 * - generateLicense - A function that compiles project information into a license format.
 */

import { ai } from '@/ai/genkit';
import { GenerateLicenseInput, GenerateLicenseInputSchema, GenerateLicenseOutput, GenerateLicenseOutputSchema } from '@/lib/data';
import { Buffer } from 'buffer';

export async function generateLicense(input: GenerateLicenseInput): Promise<GenerateLicenseOutput> {
    return generateLicenseFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateLicensePrompt',
    input: { schema: GenerateLicenseInputSchema },
    prompt: `
        You are a municipal administration system. Your task is to generate the text content for a construction license.
        The output must be a formal document in plain text format, written in Portuguese (Portugal).
        The license must be clearly structured with headers and include all the information provided.
        It must include a unique QR code placeholder like "[QR_CODE_PLACEHOLDER]".

        Compile the following information into a formal license document:

        - Project Name: {{{projectName}}}
        - Project ID: {{{projectId}}}
        - Requester Name: {{{requesterName}}}
        - Architect Name: {{{architectName}}}
        - Plot Number: {{{plotNumber}}}
        - Plot Registration: {{{plotRegistration}}}
        - Issue Date: {{{issueDate}}}

        Generate the license text.
    `,
});

const generateLicenseFlow = ai.defineFlow(
    {
        name: 'generateLicenseFlow',
        inputSchema: GenerateLicenseInputSchema,
        outputSchema: GenerateLicenseOutputSchema,
    },
    async (input) => {
        const { text } = await prompt(input);
        
        // Simulate creating a file (in this case, a plain text file)
        // and returning it as a data URI. In a real scenario, this could
        // involve a PDF generation library.
        const fileContent = Buffer.from(text, 'utf-8').toString('base64');
        const dataUri = `data:text/plain;base64,${fileContent}`;

        return {
            licenseDataUri: dataUri,
        };
    }
);
