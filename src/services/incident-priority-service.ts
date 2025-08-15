
'use server';

import { CalculateIncidentPriorityInput, PointOfInterestPriority } from "@/lib/data";
import { calculateIncidentPriorityFlow } from "@/ai/flows/calculate-incident-priority-flow";

/**
 * Calculates the priority of an incident using an AI flow.
 * @param input The incident title and description.
 * @returns The calculated priority ('low', 'medium', 'high').
 */
export async function calculateIncidentPriority(input: CalculateIncidentPriorityInput): Promise<PointOfInterestPriority> {
    const result = await calculateIncidentPriorityFlow(input);
    return result.priority;
}
