
'use server';
/**
 * @fileOverview Flow to generate a digital construction license.
 * 
 * - generateLicense - A function that compiles project information into a license format.
 */

import { ai } from '@/ai/genkit';
import { GenerateLicenseInput, GenerateLicenseInputSchema, GenerateLicenseOutput, GenerateLicenseOutputSchema } from '@/lib/data';

export async function generateLicense(input: GenerateLicenseInput): Promise<GenerateLicenseOutput> {
    return generateLicenseFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateLicensePrompt',
    input: { schema: GenerateLicenseInputSchema },
    prompt: `
        You are a municipal administration system. Your task is to generate the HTML content for a construction license.
        The output must be a well-structured and styled HTML document. The theme is formal and official.
        Use inline CSS for styling to ensure it renders correctly everywhere. The document should have a header with the municipality's name, a title, the license details in a structured way, a section for the terms and conditions, and a placeholder for a QR code.
        The document must be in Portuguese (Portugal).

        The license must include a unique QR code placeholder like "<!-- QR_CODE_PLACEHOLDER -->".

        Here is the information to include:
        - Project Name: {{{projectName}}}
        - Project ID: {{{projectId}}}
        - Requester Name: {{{requesterName}}}
        - Architect Name: {{{architectName}}}
        - Plot Number: {{{plotNumber}}}
        - Plot Registration: {{{plotRegistration}}}
        - Issue Date: {{{issueDate}}}

        Generate the full HTML document now. Ensure all styles are inline within the HTML elements or in a <style> tag in the <head>.
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
        
        // In a real scenario, you'd generate a QR code pointing to a verification URL and replace the placeholder.
        // For this simulation, we'll just return the HTML with the placeholder.
        // const verificationUrl = `https://your-app-url/verify/license/${input.projectId}`;
        // const qrCodeDataUrl = await generateQrCode(verificationUrl);
        // const finalHtml = text.replace('<!-- QR_CODE_PLACEHOLDER -->', `<img src="${qrCodeDataUrl}" alt="QR Code de Verificação" style="width:120px; height:120px;">`);

        return {
            licenseHtml: text,
        };
    }
);
