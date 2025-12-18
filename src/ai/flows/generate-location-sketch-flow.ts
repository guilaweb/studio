
'use server';
/**
 * @fileOverview Flow to generate a technical location sketch (Croqui de Localização).
 * 
 * - generateLocationSketch - A function that compiles project and plot data into an official sketch format.
 */

import { ai } from '@/ai/genkit';
import { GenerateLocationSketchInput, GenerateLocationSketchInputSchema, GenerateLocationSketchOutput, GenerateLocationSketchOutputSchema } from '@/lib/data';

export async function generateLocationSketch(input: GenerateLocationSketchInput): Promise<GenerateLocationSketchOutput> {
    return generateLocationSketchFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateLocationSketchPrompt',
    input: { schema: GenerateLocationSketchInputSchema },
    prompt: `
        You are an expert topography and GIS system. Your task is to generate the HTML content for a "Croqui de Localização" (Location Sketch) document based on the provided data.
        The output must be a single, well-structured, and professionally styled HTML document. The document must be styled to fit a standard A4 page for printing. Use a <style> tag in the <head> for all CSS.
        The document must be in Portuguese (Portugal).

        **Structure & Styling Requirements:**

        1.  **A4 Formatting & Basic Styles:**
            *   Use a \`<style>\` tag in the \`<head>\`.
            *   Include \`@page { size: A4; margin: 1cm; }\`.
            *   Use a modern, clean, sans-serif font like 'Helvetica' or 'Arial' for the body.
            *   All content should be wrapped in a \`<div class="page">\`.

        2.  **Layout:**
            *   Use a main container and structure the content logically: Header, Map, Table, Footer.
            *   Use CSS for layout (e.g., Flexbox for the footer) to ensure proper alignment.

        3.  **Map Area:**
            *   You MUST construct the Google Maps Static API URL.
            *   The path should have a red outline (\`color:0xff0000ff\`, \`weight:2\`) and a semi-transparent red fill (\`fillcolor:0xff000033\`).
            *   The map type should be 'satellite'.
            *   The image size should be large, like 800x600, for good resolution.
            *   Crucially, you MUST use the placeholder \`YOUR_API_KEY\` for the API key in the URL. The final URL must contain \`&key=YOUR_API_KEY\`.
            *   The generated \`<img>\` tag's \`src\` attribute MUST contain this complete URL.

        4.  **Coordinates Table:**
            *   Create a professional-looking table with the vertices of the plot.
            *   Columns: "VERT.", "COORDENADA ESTE (m)", "COORDENADA NORTE (m)", "LATITUDE", "LONGITUDE".
            *   **Simulate plausible UTM-like coordinates for "ESTE" and "NORTE".** A simple, consistent transformation is fine (e.g., add a large base value and multiply by a factor). The goal is realism, not geodetic accuracy.
            *   Format Latitude and Longitude to six decimal places.

        5.  **Footer Area:**
            *   A container div using flexbox (\`display: flex; justify-content: space-between;\`) for the details.
            *   Left side: Project details ("REQUERENTE", "Província", "Município", "Área", etc.).
            *   Right side: The MUNITU seal and the graphical scale.
            *   The MUNITU seal placeholder must be \`<!-- MUNITU_SEAL_PLACEHOLDER -->\`.
            *   The 'Área' value must be formatted to two decimal places and include 'm²'.
            *   **Graphical Scale:** Create a simple visual scale bar using styled divs. It should represent an approximate distance (e.g., 50m).

        **Input Data:**
        - Croqui Data: {{{json croqui}}}

        Generate the full HTML document now, following all instructions precisely.
    `,
});

const generateLocationSketchFlow = ai.defineFlow(
    {
        name: 'generateLocationSketchFlow',
        inputSchema: GenerateLocationSketchInputSchema,
        outputSchema: GenerateLocationSketchOutputSchema,
    },
    async (input) => {
        const { text } = await prompt(input);
        
        return {
            sketchHtml: text,
        };
    }
);
