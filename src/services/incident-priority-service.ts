
'use server';

import { CalculateIncidentPriorityInput } from "@/lib/data";
import { calculateIncidentPriorityFlow } from "@/ai/flows/calculate-incident-priority-flow";

/**
 * Calculates the priority of an incident using an AI flow.
 * @param input The incident title and description.
 * @returns The calculated priority ('low', 'medium', or 'high').
 */
export async function calculateIncidentPriority(input: CalculateIncidentPriorityInput): Promise<'low' | 'medium' | 'high'> {
    const result = await calculateIncidentPriorityFlow(input);
    return result.priority;
}
