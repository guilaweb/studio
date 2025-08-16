
import { z } from 'zod';

export const PointOfInterestUpdateSchema = z.object({
  id: z.string(),
  text: z.string(),
  authorId: z.string(),
  authorDisplayName: z.string().optional(),
  timestamp: z.string(),
  photoDataUri: z.string().optional(),
});

export type PointOfInterestUpdate = z.infer<typeof PointOfInterestUpdateSchema>;

const PointOfInterestStatusEnum = z.enum(['available', 'unavailable', 'unknown', 'full', 'damaged', 'collected', 'in_progress', 'occupied', 'protected', 'in_dispute', 'reserved']);
export type PointOfInterestStatus = z.infer<typeof PointOfInterestStatusEnum>;

const PointOfInterestTypeEnum = z.enum(['atm', 'construction', 'incident', 'sanitation', 'water', 'land_plot']);
export type PointOfInterestType = z.infer<typeof PointOfInterestTypeEnum>;

const PointOfInterestPriorityEnum = z.enum(['low', 'medium', 'high']);
export type PointOfInterestPriority = z.infer<typeof PointOfInterestPriorityEnum>;

const PositionSchema = z.object({ lat: z.number(), lng: z.number() });

export const PointOfInterestSchema = z.object({
  id: z.string(),
  type: PointOfInterestTypeEnum,
  position: PositionSchema,
  polygon: z.array(PositionSchema).optional(), // For land plots
  title: z.string(),
  description: z.string(),
  status: PointOfInterestStatusEnum.optional(),
  priority: PointOfInterestPriorityEnum.optional(),
  lastReported: z.string().optional(),
  incidentDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  authorId: z.string().optional(),
  updates: z.array(PointOfInterestUpdateSchema).optional(),
  // Land Plot Specific
  plotNumber: z.string().optional(),
  registrationCode: z.string().optional(),
  zoningInfo: z.string().optional(),
});

export type PointOfInterest = z.infer<typeof PointOfInterestSchema>;


export type Layer = 'atm' | 'construction' | 'incident' | 'sanitation' | 'water' | 'land_plot';

export type ActiveLayers = {
  [key in Layer]: boolean;
};

export const UserProfileSchema = z.object({
    uid: z.string(),
    displayName: z.string(),
    email: z.string(),
    photoURL: z.string().optional(),
    role: z.enum(['Cidadao', 'Agente Municipal', 'Administrador']),
    createdAt: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserProfileWithStatsSchema = UserProfileSchema.extend({
    stats: z.object({
        contributions: z.number(),
        sanitationReports: z.number(),
        incidentReports: z.number(),
    })
});
export type UserProfileWithStats = z.infer<typeof UserProfileWithStatsSchema>;

// Label Mappings
export const typeLabelMap: Record<PointOfInterestType, string> = {
    atm: "ATM",
    construction: "Obra",
    incident: "Incidente",
    sanitation: "Saneamento",
    water: "Rede de Água",
    land_plot: "Lote de Terreno",
};

export const statusLabelMap: Record<PointOfInterestStatus, string> = {
    available: "Disponível",
    unavailable: "Indisponível",
    unknown: "Desconhecido",
    collected: "Recolhido",
    full: "Cheio",
    damaged: "Danificado",
    in_progress: "Em Resolução",
    occupied: "Ocupado",
    protected: "Protegido",
    in_dispute: "Em Litígio",
    reserved: "Reservado",
};

export const priorityLabelMap: Record<PointOfInterestPriority, string> = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
};


// Schemas for AI Flows

export const GenerateOfficialResponseInputSchema = z.object({
  citizenContribution: z.string().describe("The citizen's contribution text."),
  projectName: z.string().describe("The name of the construction project."),
});
export type GenerateOfficialResponseInput = z.infer<typeof GenerateOfficialResponseInputSchema>;

export const GenerateOfficialResponseOutputSchema = z.object({
  response: z.string().describe('The generated official response.'),
});
export type GenerateOfficialResponseOutput = z.infer<typeof GenerateOfficialResponseOutputSchema>;


export const GenerateDashboardSummaryInputSchema = z.object({
  pointsOfInterest: z.array(PointOfInterestSchema),
  currentDate: z.string().describe("The current date and time in ISO format, for context."),
});
export type GenerateDashboardSummaryInput = z.infer<typeof GenerateDashboardSummaryInputSchema>;

export const GenerateDashboardSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated executive summary, in plain text. Should be concise and informative.'),
});
export type GenerateDashboardSummaryOutput = z.infer<typeof GenerateDashboardSummaryOutputSchema>;


export const DetectDuplicateInputSchema = z.object({
  newIncident: z.object({
    title: z.string(),
    description: z.string(),
    position: z.object({ lat: z.number(), lng: z.number() }),
    authorDisplayName: z.string().optional(),
  }),
  existingIncidents: z.array(PointOfInterestSchema),
});
export type DetectDuplicateInput = z.infer<typeof DetectDuplicateInputSchema>;

export const DetectDuplicateOutputSchema = z.object({
    isDuplicate: z.boolean().describe('Whether the new incident is a duplicate of an existing one.'),
    duplicateOfId: z.string().optional().describe('The ID of the existing incident it is a duplicate of, if any.'),
});
export type DetectDuplicateOutput = z.infer<typeof DetectDuplicateOutputSchema>;

export const CalculateIncidentPriorityInputSchema = z.object({
    title: z.string().describe("The title of the incident."),
    description: z.string().describe("The description of the incident."),
});
export type CalculateIncidentPriorityInput = z.infer<typeof CalculateIncidentPriorityInputSchema>;

export const CalculateIncidentPriorityOutputSchema = z.object({
    priority: PointOfInterestPriorityEnum.describe('The calculated priority of the incident.'),
});
export type CalculateIncidentPriorityOutput = z.infer<typeof CalculateIncidentPriorityOutputSchema>;
