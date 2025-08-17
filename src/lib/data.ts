
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

export const PointOfInterestStatusEnum = z.enum(['available', 'unavailable', 'unknown', 'full', 'damaged', 'collected', 'in_progress', 'occupied', 'protected', 'in_dispute', 'reserved', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'expired', 'em_verificacao', 'verificado_ouro', 'verificado_prata', 'informacao_insuficiente', 'Privado']);
export type PointOfInterestStatus = z.infer<typeof PointOfInterestStatusEnum>;

export const PointOfInterestTypeEnum = z.enum(['atm', 'construction', 'incident', 'sanitation', 'water', 'land_plot', 'announcement']);
export type PointOfInterestType = z.infer<typeof PointOfInterestTypeEnum>;

export const PointOfInterestPriorityEnum = z.enum(['low', 'medium', 'high']);
export type PointOfInterestPriority = z.infer<typeof PointOfInterestPriorityEnum>;

export const PointOfInterestUsageTypeEnum = z.enum(['residential', 'commercial', 'industrial', 'mixed', 'other']);
export type PointOfInterestUsageType = z.infer<typeof PointOfInterestUsageTypeEnum>;

export const AnnouncementCategoryEnum = z.enum(['general', 'traffic', 'event', 'public_works', 'security', 'other']);
export type AnnouncementCategory = z.infer<typeof AnnouncementCategoryEnum>;

export const PropertyTypeEnum = z.enum(['land', 'house', 'apartment', 'villa', 'farm', 'commercial']);
export type PropertyType = z.infer<typeof PropertyTypeEnum>;


const PositionSchema = z.object({ lat: z.number(), lng: z.number() });
const FileSchema = z.object({ name: z.string(), url: z.string() });

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
  authorDisplayName: z.string().optional(),
  updates: z.array(PointOfInterestUpdateSchema).optional(),
  files: z.array(FileSchema).optional(),
  // Land Plot & Property Specific
  propertyType: PropertyTypeEnum.optional(),
  area: z.number().optional(), // in square meters
  builtArea: z.number().optional(), // in square meters
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  plotNumber: z.string().optional(),
  registrationCode: z.string().optional(),
  zoningInfo: z.string().optional(), // General notes
  usageType: PointOfInterestUsageTypeEnum.optional(),
  maxHeight: z.number().optional(), // in floors
  buildingRatio: z.number().optional(), // percentage
  // Project Specific
  landPlotId: z.string().optional(),
  projectType: z.string().optional(),
  architectName: z.string().optional(),
  // Announcement Specific
  announcementCategory: AnnouncementCategoryEnum.optional(),
});

export type PointOfInterest = z.infer<typeof PointOfInterestSchema>;


export type Layer = 'atm' | 'construction' | 'incident' | 'sanitation' | 'water' | 'land_plot' | 'announcement';

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
    onboardingCompleted: z.boolean().optional(),
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
    construction: "Obra/Projeto",
    incident: "Incidente",
    sanitation: "Saneamento",
    water: "Rede de Água",
    land_plot: "Lote de Terreno",
    announcement: "Anúncio",
};

export const statusLabelMap: Record<PointOfInterestStatus, string> = {
    available: "Disponível",
    unavailable: "Indisponível",
    unknown: "Desconhecido",
    collected: "Recolhido",
    full: "Cheio",
    damaged: "Danificado",
    in_progress: "Em Progresso",
    occupied: "Ocupado",
    protected: "Protegido",
    in_dispute: "Em Litígio",
    reserved: "Reservado",
    submitted: "Submetido",
    under_review: "Em Análise",
    approved: "Aprovado",
    rejected: "Rejeitado",
    active: "Ativo",
    expired: "Expirado",
    em_verificacao: "Em Verificação",
    verificado_ouro: "Verificado (Ouro)",
    verificado_prata: "Verificado (Prata)",
    informacao_insuficiente: "Informação Insuficiente",
    Privado: "Privado",
};

export const priorityLabelMap: Record<PointOfInterestPriority, string> = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
};

export const announcementCategoryMap: Record<AnnouncementCategory, string> = {
    general: 'Aviso Geral',
    traffic: 'Trânsito',
    event: 'Evento',
    public_works: 'Obras Públicas',
    security: 'Segurança',
    other: 'Outro',
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


export const AnalyzeProjectComplianceInputSchema = z.object({
  projectType: z.string().describe("The type of project being submitted (e.g., new build, remodel)."),
  projectDescription: z.string().describe("The detailed description of the project."),
  plotZoning: z.object({
    usageType: PointOfInterestUsageTypeEnum.optional().describe("The permitted usage for the plot (e.g., residential, commercial)."),
    maxHeight: z.number().optional().describe("The maximum allowed building height in floors."),
    buildingRatio: z.number().optional().describe("The maximum allowed building-to-plot area ratio as a percentage."),
    zoningInfo: z.string().optional().describe("Additional zoning notes and regulations."),
  }).describe("The zoning regulations for the selected land plot."),
});
export type AnalyzeProjectComplianceInput = z.infer<typeof AnalyzeProjectComplianceInputSchema>;

export const AnalyzeProjectComplianceOutputSchema = z.object({
  isCompliant: z.boolean().describe('Whether the project seems to be compliant with the zoning regulations.'),
  analysis: z.string().describe('A brief analysis explaining the compliance check result. Mention specific points of compliance or non-compliance.'),
});
export type AnalyzeProjectComplianceOutput = z.infer<typeof AnalyzeProjectComplianceOutputSchema>;

export const SuggestNextStepsInputSchema = z.object({
  projectType: z.string().optional().describe("The type of project (e.g., 'Construção Nova', 'Remodelação')."),
  projectDescription: z.string().describe("The detailed description of the project."),
  usageType: PointOfInterestUsageTypeEnum.optional().describe("The permitted usage for the plot (e.g., 'residencial', 'industrial').")
});
export type SuggestNextStepsInput = z.infer<typeof SuggestNextStepsInputSchema>;

export const SuggestNextStepsOutputSchema = z.object({
  steps: z.array(z.object({
    department: z.string().describe("The name of the department that needs to provide a review/opinion."),
    reason: z.string().describe("A brief reason why this department's review is necessary, in Portuguese (Portugal)."),
    status: z.enum(['pending', 'completed', 'not_required']).describe("The current status of this step."),
  })).describe("A list of suggested next steps or required reviews for the project."),
});
export type SuggestNextStepsOutput = z.infer<typeof SuggestNextStepsOutputSchema>;


export const GenerateLicenseInputSchema = z.object({
  projectName: z.string(),
  projectId: z.string(),
  requesterName: z.string(),
  architectName: z.string().optional(),
  plotNumber: z.string().optional(),
  plotRegistration: z.string().optional(),
  issueDate: z.string(),
});
export type GenerateLicenseInput = z.infer<typeof GenerateLicenseInputSchema>;

export const GenerateLicenseOutputSchema = z.object({
  licenseHtml: z.string().describe("The full HTML content of the generated license."),
});
export type GenerateLicenseOutput = z.infer<typeof GenerateLicenseOutputSchema>;
