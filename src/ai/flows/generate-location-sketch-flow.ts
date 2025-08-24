
'use server';
/**
 * @fileOverview Flow to generate a technical location sketch (Croqui de Localização).
 * 
 * - generateLocationSketch - A function that compiles project and plot data into an official sketch format.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const PlotDataSchema = z.object({
  polygon: z.array(PointSchema).describe("The array of coordinates forming the plot's polygon."),
  area: z.number().optional().describe("The area of the plot in square meters."),
  perimeter: z.number().optional().describe("The perimeter of the plot in meters."),
  plotNumber: z.string().optional().describe("The official number of the plot."),
});

const ProjectDataSchema = z.object({
  requesterName: z.string().describe("The name of the person or entity requesting the license."),
  municipality: z.string().describe("The municipality where the plot is located."),
  province: z.string().describe("The province where the plot is located."),
  date: z.string().describe("The date the sketch is generated."),
});

export const GenerateLocationSketchInputSchema = z.object({
  plot: PlotDataSchema,
  project: ProjectDataSchema,
});
export type GenerateLocationSketchInput = z.infer<typeof GenerateLocationSketchInputSchema>;

export const GenerateLocationSketchOutputSchema = z.object({
  sketchHtml: z.string().describe("The full HTML content of the generated location sketch document."),
});
export type GenerateLocationSketchOutput = z.infer<typeof GenerateLocationSketchOutputSchema>;

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
        2.  **Map Area:** This section should be divided into two main panels:
            *   **Top Panel (Satellite View):** Display a static Google Maps satellite image centered on the plot's polygon. The polygon should be clearly outlined on the map.
            *   **Bottom Panel (Roadmap View):** Display a static Google Maps roadmap/topographic style image of the same area.
        3.  **Coordinates Table:** Below the maps, create a table with the vertices of the plot. The table must have columns for: "Estaca" (Vertex Number), "Norte (m)" (UTM Y), "Este (m)" (UTM X), "Latitude", and "Longitude". You must calculate the approximate UTM coordinates (mock calculation is acceptable) and format the geographic coordinates.
        4.  **Footer Area:** This area should be divided into sections:
            *   A small box showing the plot's shape.
            *   A "Proprietário" (Owner) section with the requester's name.
            *   A "Detalhes" (Details) section with "Município", "Província", "Escala", "Área", "Perímetro".
            *   A "Serviços" section.
            *   A placeholder for a signature ("Assinatura").
            *   An area for the company logo/details.

        **Data Transformation Rules:**
        -   The center of the map should be the geometric center of the provided polygon.
        -   The Google Maps Static API requires a center point, zoom level, and path for the polygon. You must construct these URLs correctly.
        -   For the coordinates table, you must simulate a plausible conversion from Lat/Lng to a mock UTM-like coordinate system (e.g., adding a base value to the decimal degrees multiplied by a factor). The goal is to populate the table, not achieve perfect geodetic accuracy.
        
        **Static Map API URL Construction:**
        -   Satellite: \`https://maps.googleapis.com/maps/api/staticmap?center=LAT,LNG&zoom=18&size=600x400&maptype=satellite&path=color:0xff0000ff|weight:2|fillcolor:0xff000033|...path_points...\`
        -   Roadmap: \`https://maps.googleapis.com/maps/api/staticmap?center=LAT,LNG&zoom=18&size=600x400&maptype=roadmap&path=color:0xff0000ff|weight:2|...path_points...\`
        -   Remember to include the Google Maps API Key in the URL: \`&key=YOUR_API_KEY\` (use the placeholder YOUR_API_KEY, it will be replaced).

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
