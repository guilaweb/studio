

import { z } from 'zod';

export const QueueTimeEnum = z.enum(['none', 'short', 'medium', 'long']);
export type QueueTime = z.infer<typeof QueueTimeEnum>;

export const PointOfInterestUpdateSchema = z.object({
  id: z.string(),
  text: z.string().optional().default(''),
  authorId: z.string(),
  authorDisplayName: z.string().default('Cidadão Anónimo'),
  timestamp: z.string(),
  photoDataUri: z.string().optional(),
  availableNotes: z.array(z.number()).optional(),
  queueTime: QueueTimeEnum.optional(),
});

export type PointOfInterestUpdate = z.infer<typeof PointOfInterestUpdateSchema>;

export const PointOfInterestStatusEnum = z.enum(['available', 'unavailable', 'unknown', 'full', 'damaged', 'collected', 'in_progress', 'occupied', 'protected', 'in_dispute', 'reserved', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'expired', 'em_verificacao', 'verificado_ouro', 'verificado_prata', 'informacao_insuficiente', 'Privado']);
export type PointOfInterestStatus = z.infer<typeof PointOfInterestStatusEnum>;

export const PointOfInterestTypeEnum = z.enum(['atm', 'construction', 'incident', 'sanitation', 'water', 'land_plot', 'announcement', 'water_resource', 'croqui']);
export type PointOfInterestType = z.infer<typeof PointOfInterestTypeEnum>;

export const PointOfInterestPriorityEnum = z.enum(['low', 'medium', 'high']);
export type PointOfInterestPriority = z.infer<typeof PointOfInterestPriorityEnum>;

export const PointOfInterestUsageTypeEnum = z.enum(['residential', 'commercial', 'industrial', 'mixed', 'other']);
export type PointOfInterestUsageType = z.infer<typeof PointOfInterestUsageTypeEnum>;

export const AnnouncementCategoryEnum = z.enum(['general', 'traffic', 'event', 'public_works', 'security', 'other']);
export type AnnouncementCategory = z.infer<typeof AnnouncementCategoryEnum>;

export const PropertyTypeEnum = z.enum(['land', 'house', 'apartment', 'villa', 'farm', 'commercial']);
export type PropertyType = z.infer<typeof PropertyTypeEnum>;

export const PropertyTaxStatusEnum = z.enum(['paid', 'due']);
export type PropertyTaxStatus = z.infer<typeof PropertyTaxStatusEnum>;

const SustainabilityFeaturesSchema = z.object({
    solarPanels: z.boolean().optional(),
    rainwaterHarvesting: z.boolean().optional(),
    greenRoofs: z.boolean().optional(),
    permeablePavements: z.boolean().optional(),
    evCharging: z.boolean().optional(),
}).optional();

const PositionSchema = z.object({ lat: z.number(), lng: z.number() });
const FileSchema = z.object({ name: z.string(), url: z.string() });
const CroquiPointSchema = z.object({
    position: PositionSchema,
    label: z.string(),
    type: z.enum(['munitu', 'custom']),
});
export type CroquiPoint = z.infer<typeof CroquiPointSchema>;

export const PointOfInterestSchema = z.object({
  id: z.string(),
  type: PointOfInterestTypeEnum,
  position: PositionSchema,
  polygon: z.array(PositionSchema).optional(),
  polyline: z.array(PositionSchema).optional(),
  title: z.string().optional(),
  description: z.string(),
  status: PointOfInterestStatusEnum.optional(),
  priority: PointOfInterestPriorityEnum.optional(),
  price: z.number().optional(),
  propertyTaxStatus: PropertyTaxStatusEnum.optional(),
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
  minLotArea: z.number().optional(), // Loteamento
  roadCession: z.number().optional(), // Loteamento
  greenSpaceCession: z.number().optional(), // Loteamento
  // Project Specific
  landPlotId: z.string().optional(),
  projectType: z.string().optional(),
  architectName: z.string().optional(),
  // Announcement Specific
  announcementCategory: AnnouncementCategoryEnum.optional(),
  // Croqui Specific
  croquiId: z.string().optional(), // Link to a croqui
  croquiPoints: z.array(CroquiPointSchema).optional(),
  croquiRoute: z.array(PositionSchema).optional(),
  collectionId: z.string().optional(),
  collectionName: z.string().optional(),
  customData: z.record(z.string()).optional(),
  // Duplicate detection
  potentialDuplicateOfId: z.string().optional(),
  // Sustainability
  sustainableSeal: z.boolean().optional(),
  sustainabilityFeatures: SustainabilityFeaturesSchema,
});

export type PointOfInterest = z.infer<typeof PointOfInterestSchema>;


export type Layer = 'atm' | 'construction' | 'incident' | 'sanitation' | 'water' | 'land_plot' | 'announcement' | 'water_resource' | 'croqui';

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
    phoneNumber: z.string().optional(),
    // Real-time status fields from the mobile app
    location: PositionSchema.optional(),
    status: z.enum(['Disponível', 'Em Rota', 'Ocupado', 'Offline']).optional(),
    team: z.enum(['Eletricidade', 'Saneamento', 'Geral']).optional(),
    vehicle: z.object({ type: z.string(), plate: z.string() }).optional(),
    currentTask: PointOfInterestSchema.optional().nullable(),
    taskQueue: z.array(PointOfInterestSchema).optional(),
    stats: z.object({ completed: z.number(), avgTime: z.string() }).optional(),
    path: z.array(PositionSchema).optional(),
    skills: z.array(z.string()).optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserProfileWithStatsSchema = UserProfileSchema.extend({
    stats: z.object({
        contributions: z.number(),
        sanitationReports: z.number(),
        incidentReports: z.number(),
        completed: z.number(),
        avgTime: z.string(),
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
    water_resource: "Recurso Hídrico",
    croqui: "Croqui de Localização",
};

export const propertyTypeLabelMap: Record<PropertyType, string> = {
    land: "Terreno Vazio",
    house: "Casa Térrea",
    apartment: "Apartamento",
    villa: "Vivenda",
    farm: "Fazenda",
    commercial: "Espaço Comercial"
};


export const statusLabelMap: Partial<Record<PointOfInterestStatus, string>> = {
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

export const queueTimeLabelMap: Record<QueueTime, string> = {
    none: 'Sem fila',
    short: 'Curta (até 5 pessoas)',
    medium: 'Média (5-10 pessoas)',
    long: 'Longa (+10 pessoas)',
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


export const DashboardStatsSchema = z.object({
    totalPoints: z.number(),
    newIncidentsCount: z.number(),
    incidentClustersCount: z.number(),
    sanitationResolutionRate: z.number(),
    fullContainersCount: z.number(),
    newConstructionUpdatesCount: z.number(),
});
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const GenerateDashboardSummaryInputSchema = z.object({
  stats: DashboardStatsSchema,
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
    duplicateOfId: z.string().nullable().describe('The ID of the most likely existing incident it could be a duplicate of. If no duplicate is found, this should be null.'),
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
  projectType: z.string().optional().describe("The type of project being submitted (e.g., new build, remodel)."),
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


export const AnalyzeEnvironmentalImpactInputSchema = z.object({
    projectDescription: z.string().describe("The detailed description of the project."),
    projectType: z.string().optional().describe("The type of project (e.g., 'loteamento', 'new-build')."),
    area: z.number().optional().describe("The total area of the plot in square meters."),
});
export type AnalyzeEnvironmentalImpactInput = z.infer<typeof AnalyzeEnvironmentalImpactInputSchema>;

export const AnalyzeEnvironmentalImpactOutputSchema = z.object({
    drainageAnalysis: z.string().describe("Analysis of water management and drainage. Suggests improvements like permeable pavements or retention basins."),
    heatIslandAnalysis: z.string().describe("Analysis of the heat island effect. Suggests increasing green spaces or using reflective materials."),
    energyEfficiencyAnalysis: z.string().describe("Analysis of energy and water efficiency. Suggests things like rainwater harvesting or ideal solar orientation."),
});
export type AnalyzeEnvironmentalImpactOutput = z.infer<typeof AnalyzeEnvironmentalImpactOutputSchema>;

export const AnalyzePropertyDocumentInputSchema = z.object({
    documentDataUri: z.string().describe("A property document image as a data URI."),
});
export type AnalyzePropertyDocumentInput = z.infer<typeof AnalyzePropertyDocumentInputSchema>;

export const AnalyzePropertyDocumentOutputSchema = z.object({
    ownerName: z.string().describe("The name of the owner extracted from the document."),
    registrationNumber: z.string().describe("The official registration number of the property."),
    plotArea: z.number().optional().describe("The area of the plot in square meters, if mentioned."),
    summary: z.string().describe("A brief summary of the document's content."),
    confidenceScore: z.number().min(0).max(100).describe("A confidence score (0-100) on the document's authenticity."),
    redFlags: z.array(z.string()).describe("A list of potential red flags or issues observed."),
});
export type AnalyzePropertyDocumentOutput = z.infer<typeof AnalyzePropertyDocumentOutputSchema>;

export const SuggestTechnicianInputSchema = z.object({
    task: z.object({
        id: z.string(),
        title: z.string(),
        location: PositionSchema,
    }),
    technicians: z.array(z.object({
        id: z.string(),
        name: z.string(),
        location: PositionSchema,
        status: z.enum(['Disponível', 'Em Rota', 'Ocupado', 'Offline']),
        skills: z.array(z.string()).optional(),
        taskQueueSize: z.number(),
    })),
});
export type SuggestTechnicianInput = z.infer<typeof SuggestTechnicianInputSchema>;

export const SuggestTechnicianOutputSchema = z.object({
    suggestions: z.array(z.object({
        technicianId: z.string(),
        rank: z.number().int().positive(),
        reason: z.string(),
    })).describe("An ordered list of the top 3 technician suggestions."),
});
export type SuggestTechnicianOutput = z.infer<typeof SuggestTechnicianOutputSchema>;


// Schemas for Chat / Inbox
export const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderDisplayName: z.string(),
  text: z.string(),
  timestamp: z.string(),
  readBy: z.array(z.string()).default([]),
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  id: z.string(), // e.g., `${propertyId}-${buyerId}`
  propertyId: z.string(),
  propertyTitle: z.string(),
  propertyImage: z.string().optional(),
  participants: z.array(z.string()), // [sellerId, buyerId]
  participantDetails: z.array(z.object({
      uid: z.string(),
      displayName: z.string(),
      photoURL: z.string().optional(),
  })),
  lastMessage: MessageSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const GenerateLocationSketchInputSchema = z.object({
  plot: z.object({
    polygon: z.array(PositionSchema).describe("The array of coordinates forming the plot's polygon."),
    area: z.number().optional().describe("The area of the plot in square meters."),
    perimeter: z.number().optional().describe("The perimeter of the plot in meters."),
    plotNumber: z.string().optional().describe("The official number of the plot."),
  }),
  project: z.object({
    requesterName: z.string().describe("The name of the person or entity requesting the license."),
    municipality: z.string().describe("The municipality where the plot is located."),
    province: z.string().describe("The province where the plot is located."),
    date: z.string().describe("The date the sketch is generated."),
  }),
});
export type GenerateLocationSketchInput = z.infer<typeof GenerateLocationSketchInputSchema>;

export const GenerateLocationSketchOutputSchema = z.object({
  sketchHtml: z.string().describe("The full HTML content of the generated location sketch document."),
});
export type GenerateLocationSketchOutput = z.infer<typeof GenerateLocationSketchOutputSchema>;
