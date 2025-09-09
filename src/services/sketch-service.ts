
'use server';

import { GenerateLocationSketchInput, GenerateLocationSketchOutput } from "@/lib/data";
import { generateLocationSketch as generateLocationSketchFlow } from "@/ai/flows/generate-location-sketch-flow";

/**
 * Generates a location sketch document.
 * @param input The data required to generate the sketch.
 * @returns An object containing the HTML for the sketch.
 */
export async function generateLocationSketch(input: GenerateLocationSketchInput): Promise<GenerateLocationSketchOutput> {
    const result = await generateLocationSketchFlow(input);
    return result;
}
