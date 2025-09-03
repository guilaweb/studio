
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

        1.  **A4 Formatting:**
            *   Use a \`<style>\` tag in the \`<head>\`.
            *   Include \`@page { size: A4; margin: 1cm; }\` to set the print size.
            *   Wrap all content in a \`<div class="page">\`.
            *   Use a modern, sans-serif font like 'Helvetica' or 'Arial'.

        2.  **Layout:**
            *   Use Flexbox for the main layout (\`display: flex; flex-direction: column;\`) to structure the header, map, table, and footer.
            *   The main content area (map, table) should expand to fill available space (\`flex-grow: 1;\`).

        3.  **Header:**
            *   A main title "CROQUIS DE LOCALIZAÇÃO" centered at the top.

        4.  **Map Area:**
            *   A container \`div\` with a border around the map image.
            *   The image must be a high-resolution (e.g., 800x600) static Google Maps satellite image centered on the plot's polygon.
            *   The polygon must be clearly outlined on the map (e.g., red outline).
            *   You MUST construct the Google Maps Static API URL correctly. The path should have a red outline (\`color:0xff0000ff\`) and a semi-transparent red fill (\`fillcolor:0xff000033\`).
            *   Crucially, you MUST use the placeholder \`YOUR_API_KEY\` for the API key in the URL. The final URL must contain \`&key=YOUR_API_KEY\`.

        5.  **Coordinates Table:**
            *   Create a professional table with the vertices of the plot.
            *   Columns: "VERT.", "COORDENADA ESTE (m)", "COORDENADA NORTE (m)", "LATITUDE", "LONGITUDE".
            *   You must simulate plausible UTM-like coordinates for "ESTE" and "NORTE". A simple, consistent transformation is fine (e.g., add a large base value and multiply by a factor). The goal is realism, not geodetic accuracy.
            *   Format Latitude and Longitude in Degrees, Minutes, and Seconds.

        6.  **Footer Area:**
            *   A container div using flexbox (\`display: flex; justify-content: space-between;\`) for the details.
            *   Left side: Project details ("REQUERENTE", "Província", "Município", "Área", etc.).
            *   Right side: The MUNITU seal and the graphical scale.
            *   The MUNITU seal placeholder must be \`<!-- MUNITU_SEAL_PLACEHOLDER -->\`.
            *   The 'Área' value must be formatted to two decimal places and include 'm²'.
            *   **Graphical Scale:** Create a simple visual scale bar using styled divs. It should represent an approximate distance (e.g., 50m).

        **Input Data:**
        - Project Data: {{{json project}}}
        - Plot Data: {{{json plot}}}

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

