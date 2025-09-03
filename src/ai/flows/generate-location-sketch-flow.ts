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
        The output must be a single, well-structured, and professionally styled HTML document. The theme must be formal and official, mimicking the layout of a technical topography document. Use inline CSS for all styling to ensure maximum compatibility.
        The document must be in Portuguese (Portugal).

        **Structure Requirements:**
        1.  **Header:** A main title "CROQUIS DE LOCALIZAÇÃO".
        2.  **Map Area:** This section should display a large, high-resolution static Google Maps satellite image centered on the plot's polygon. The polygon should be clearly outlined on the map.
        3.  **Coordinates Table:** Below the map, create a table with the vertices of the plot. The table must have columns for: "VERT" (Vertex Number), "ESTE (m)", "NORTE (m)", "LATITUDE", and "LONGITUDE". You must calculate the approximate UTM-like coordinates (a plausible mock calculation is acceptable) and format the geographic coordinates.
        4.  **Footer Area:** This area should contain the project details such as "REQUERENTE", "Província", "Município", "Área", etc., professionally laid out. Include a placeholder for a signature.

        **Data Transformation Rules:**
        -   The center of the map should be the geometric center of the provided polygon.
        -   The Google Maps Static API requires a center point, zoom level, and path for the polygon. You must construct the URL correctly. The path should have a red outline and a semi-transparent red fill.
        -   For the coordinates table, you must simulate a plausible conversion from Lat/Lng to a mock UTM-like coordinate system (e.g., adding a base value to the decimal degrees multiplied by a large factor to simulate meters). The goal is to populate the table with realistic-looking numbers, not achieve perfect geodetic accuracy.
        -   Format Latitude and Longitude in Degrees, Minutes, and Seconds.

        **Static Map API URL Construction:**
        -   Example: \`https://maps.googleapis.com/maps/api/staticmap?center=LAT,LNG&zoom=18&size=800x600&maptype=satellite&path=color:0xff0000ff|weight:2|fillcolor:0xff000033|...path_points...\`
        -   Remember to include the Google Maps API Key in the URL: \`&key=YOUR_API_KEY\` (use the placeholder YOUR_API_KEY, it will be replaced later).

        **Input Data:**
        - Project Data: {{{json project}}}
        - Plot Data: {{{json plot}}}

        Generate the full HTML document now.
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
