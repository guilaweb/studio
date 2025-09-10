
import { z } from 'zod';

export const QueueTimeEnum = z.enum(['none', 'short', 'medium', 'long']);
export type QueueTime = z.infer<typeof QueueTimeEnum>;

export const CroquiPointSchema = z.object({
    position: z.object({ lat: z.number(), lng: z.number() }),
    label: z.string(),
    type: z.enum(['munitu', 'custom']),
});
export type CroquiPoint = z.infer<typeof CroquiPointSchema>;


export const PointOfInterestUpdateSchema = z.object({
  id: z.string(),
  text: z.string().optional().default(''),
  authorId: z.string(),
  authorDisplayName: z.string().default('Cidadão Anónimo'),
  timestamp: z.string(),
  photoDataUri: z.string().optional(),
  availableNotes: z.array(z.number()).optional(),
  availableFuels: z.array(z.string()).optional(),
  queueTime: QueueTimeEnum.optional(),
  partsUsed: z.array(z.object({
      partId: z.string(),
      name: z.string(),
      quantity: z.number(),
  })).optional(),
});

export type PointOfInterestUpdate = z.infer<typeof PointOfInterestUpdateSchema>;

export const PointOfInterestStatusEnum = z.enum(['available', 'unavailable', 'unknown', 'full', 'damaged', 'collected', 'in_progress', 'occupied', 'protected', 'in_dispute', 'reserved', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'expired', 'em_verificacao', 'verificado_ouro', 'verificado_prata', 'informacao_insuficiente', 'Privado', 'level_low', 'level_normal', 'level_flood', 'resolved', 'funcional', 'desligado']);
export type PointOfInterestStatus = z.infer<typeof PointOfInterestStatusEnum>;

export const PointOfInterestTypeEnum = z.enum(['atm', 'construction', 'incident', 'sanitation', 'water', 'land_plot', 'announcement', 'water_resource', 'croqui', 'fuel_station', 'health_unit', 'health_case', 'lighting_pole']);
export type PointOfInterestType = z.infer<typeof PointOfInterestTypeEnum>;

export const PointOfInterestPriorityEnum = z.enum(['low', 'medium', 'high']);
export type PointOfInterestPriority = z.infer<typeof PointOfInterestPriorityEnum>;

export const PointOfInterestUsageTypeEnum = z.enum(['residential', 'commercial', 'industrial', 'mixed', 'other']);
export type PointOfInterestUsageType = z.infer<typeof PointOfInterestUsageTypeEnum>;

export const AnnouncementCategoryEnum = z.enum(['general', 'traffic', 'event', 'public_works', 'security', 'flood_warning', 'drought_warning', 'other']);
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


export const WorkflowStepSchema = z.object({
    id: z.string(),
    department: z.string().describe("The name of the department that needs to provide a review/opinion."),
    reason: z.string().describe("A brief reason why this department's review is necessary, in Portuguese (Portugal)."),
    status: z.enum(['pending', 'completed', 'not_required']).describe("The current status of this step."),
});
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;


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
  workflowSteps: z.array(WorkflowStepSchema).optional(),
  // Announcement Specific
  announcementCategory: AnnouncementCategoryEnum.optional(),
  // Croqui Specific
  croquiId: z.string().optional(), // Link to a croqui
  croquiType: z.enum(['urban', 'rural', 'complex', 'event']).optional(),
  croquiPoints: z.array(CroquiPointSchema).optional(),
  croquiRoute: z.array(PositionSchema).optional(),
  collectionId: z.string().optional(),
  collectionName: z.string().optional(),
  customData: z.record(z.any()).optional(),
  // Duplicate detection
  potentialDuplicateOfId: z.string().optional(),
  // Sustainability
  sustainableSeal: z.boolean().optional(),
  sustainabilityFeatures: SustainabilityFeaturesSchema,
   // Maintenance
  maintenanceId: z.string().optional(),
  cost: z.number().optional(),
  partsCost: z.number().optional(),
  laborCost: z.number().optional(),
  // Health
  healthServices: z.array(z.string()).optional(),
  healthInspections: z.array(PointOfInterestUpdateSchema).optional(),
  licensingStatus: z.enum(['licensed', 'pending', 'expired', 'non_compliant']).optional(),
  lastInspectionDate: z.string().optional(),
  capacity: z.object({
      beds: z.number().optional(),
      icu_beds: z.number().optional(),
      daily_capacity: z.number().optional(),
  }).optional(),
  // Lighting Pole Specific
  lampType: z.enum(['led', 'sodio', 'mercurio', 'outra']).optional(),
  poleType: z.enum(['betao', 'metalico', 'madeira']).optional(),
  poleHeight: z.number().optional(),
});

export type PointOfInterest = z.infer<typeof PointOfInterestSchema>;


export type Layer = 'atm' | 'construction' | 'incident' | 'sanitation' | 'water' | 'land_plot' | 'announcement' | 'water_resource' | 'croqui' | 'fuel_station' | 'health_unit' | 'health_case' | 'lighting_pole';

export type ActiveLayers = {
  [key in Layer]: boolean;
};


export const UserProfileSchema = z.object({
    uid: z.string(),
    displayName: z.string(),
    email: z.string(),
    photoURL: z.string().nullable().optional(),
    role: z.enum(['Cidadao', 'Agente Municipal', 'Administrador', 'Epidemiologista']),
    createdAt: z.string().optional(),
    onboardingCompleted: z.boolean().optional(),
    organizationId: z.string().optional(), // To link user to a municipality/company
    // Team management fields
    status: z.enum(['Disponível', 'Em Rota', 'Ocupado', 'Offline']).optional(),
    location: PositionSchema.optional().nullable(),
    team: z.enum(['Saneamento', 'Eletricidade', 'Geral']).optional(),
    currentTask: PointOfInterestSchema.nullable().optional(),
    taskQueue: z.array(PointOfInterestSchema).optional(),
    path: z.array(PositionSchema).optional(),
    phoneNumber: z.string().optional(),
    cnhCategory: z.string().optional(),
    cnhExpiration: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    skills: z.array(z.string()).optional(),
    stats: z.object({
        completed: z.number().optional(),
        avgTime: z.string().optional(),
        performanceScore: z.number().optional(),
    }).optional(),
    vehicle: z.object({
        type: z.string().optional(),
        plate: z.string().optional(),
        odometer: z.number().optional(),
        maintenancePlanIds: z.array(z.string()).optional(),
        lastServiceDate: z.string().optional(), // ISO string
        lastServiceOdometer: z.number().optional(),
    }).optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserProfileWithStatsSchema = UserProfileSchema.extend({
    stats: z.object({
        contributions: z.number(),
        sanitationReports: z.number(),
        incidentReports: z.number(),
        // include all from UserProfile stats too
        completed: z.number().optional(),
        avgTime: z.string().optional(),
        performanceScore: z.number().optional(),
    })
});
export type UserProfileWithStats = z.infer<typeof UserProfileWithStatsSchema>;

export const FuelEntrySchema = z.object({
    id: z.string().optional(),
    vehicleId: z.string(),
    driverName: z.string(),
    vehiclePlate: z.string(),
    date: z.string(), // ISO string
    odometer: z.number(),
    liters: z.number(),
    cost: z.number(),
    createdAt: z.string().optional(),
});
export type FuelEntry = z.infer<typeof FuelEntrySchema>;

export const InventoryPartSchema = z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string().optional(),
    stock: z.number(),
    cost: z.number(),
    supplier: z.string().optional(),
    createdAt: z.string(),
});
export type InventoryPart = z.infer<typeof InventoryPartSchema>;

export const SubscriptionPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    priceAnnual: z.number().optional(),
    currency: z.string().default('AOA'),
    limits: z.object({
        agents: z.number().describe("Number of agents allowed. -1 for unlimited."),
        storageGb: z.number().describe("Storage in GB. -1 for unlimited."),
        apiCalls: z.number().describe("API calls per month. -1 for unlimited."),
    }),
    features: z.array(z.string()).optional(),
    active: z.boolean().default(true),
});
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;


export const SubscriptionStatusEnum = z.enum(['active', 'trialing', 'past_due', 'canceled', 'unpaid']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export const SubscriptionSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    planId: z.string(),
    status: SubscriptionStatusEnum,
    currentPeriodStart: z.string(), // ISO string
    currentPeriodEnd: z.string(), // ISO string
    billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
    cancelAtPeriodEnd: z.boolean(),
    createdAt: z.string(),
    limits: z.object({
        agents: z.number(),
        storageGb: z.number(),
        apiCalls: z.number(),
    }),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const PaymentSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    amount: z.number(),
    date: z.string(), // ISO string
    planId: z.string(),
    status: z.enum(['completed', 'pending', 'failed']),
    description: z.string(),
    invoiceUrl: z.string().optional(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const MessageSchema = z.object({
    id: z.string(),
    senderId: z.string(),
    senderDisplayName: z.string(),
    text: z.string(),
    timestamp: z.string(), // ISO string
    readBy: z.array(z.string()),
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
    id: z.string(),
    participants: z.array(z.string()),
    participantDetails: z.array(z.object({
        uid: z.string(),
        displayName: z.string(),
        photoURL: z.string().nullable().optional(),
    })),
    propertyId: z.string(),
    propertyTitle: z.string(),
    propertyImage: z.string().optional(),
    lastMessage: MessageSchema.optional(),
    createdAt: z.string(), // ISO string
    updatedAt: z.string(), // ISO string
});
export type Conversation = z.infer<typeof ConversationSchema>;


// Label Mappings
export const typeLabelMap: Partial<Record<PointOfInterestType, string>> = {
    atm: "ATM",
    construction: "Obra/Projeto",
    incident: "Incidente",
    sanitation: "Saneamento",
    water: "Rede de Água",
    land_plot: "Lote de Terreno",
    announcement: "Anúncio",
    water_resource: "Recurso Hídrico",
    croqui: "Croqui de Localização",
    fuel_station: "Posto de Combustível",
    health_unit: "Unidade Sanitária",
    health_case: "Caso Clínico",
    lighting_pole: "Poste de Iluminação",
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
    level_low: "Nível Baixo",
    level_normal: "Nível Normal",
    level_flood: "Nível de Cheia",
    resolved: "Resolvido",
    funcional: "Funcional",
    desligado: "Desligado",
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
    flood_warning: 'Alerta de Cheia',
    drought_warning: 'Alerta de Seca',
    other: 'Outro'
};

export const queueTimeLabelMap: Record<QueueTime, string> = {
    none: 'Sem fila',
    short: 'Curta (até 5 pessoas)',
    medium: 'Média (5-10 pessoas)',
    long: 'Longa (+10 pessoas)',
};


// SAAS Plan Details (DEPRECATED - Now fetched from Firestore)


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
    id: z.string(),
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


export const AnalyzeAtmHistoryInputSchema = z.object({
  updates: z.array(PointOfInterestUpdateSchema).describe("An array of status updates for a single ATM."),
});
export type AnalyzeAtmHistoryInput = z.infer<typeof AnalyzeAtmHistoryInputSchema>;

export const AnalyzeAtmHistoryOutputSchema = z.object({
  availableNotesSummary: z.string().describe("A summary of the most frequently reported available banknotes."),
  queuePatternSummary: z.string().describe("A summary of observed queue patterns based on timestamps."),
  restockPatternSummary: z.string().describe("An inferred summary of the ATM's restocking schedule."),
});
export type AnalyzeAtmHistoryOutput = z.infer<typeof AnalyzeAtmHistoryOutputSchema>;


export const AnalyzeEnvironmentalImpactInputSchema = z.object({
    projectDescription: z.string(),
    projectType: z.string().optional(),
    area: z.number().optional(),
});
export type AnalyzeEnvironmentalImpactInput = z.infer<typeof AnalyzeEnvironmentalImpactInputSchema>;

export const AnalyzeEnvironmentalImpactOutputSchema = z.object({
    drainageAnalysis: z.string().describe("Feedback on drainage and water management."),
    heatIslandAnalysis: z.string().describe("Feedback on mitigating the heat island effect."),
    energyEfficiencyAnalysis: z.string().describe("Feedback on energy efficiency and ventilation."),
});
export type AnalyzeEnvironmentalImpactOutput = z.infer<typeof AnalyzeEnvironmentalImpactOutputSchema>;

export const AnalyzePropertyDocumentInputSchema = z.object({
    documentDataUri: z.string().describe("An image of a property document, as a data URI."),
});
export type AnalyzePropertyDocumentInput = z.infer<typeof AnalyzePropertyDocumentInputSchema>;

export const AnalyzePropertyDocumentOutputSchema = z.object({
    ownerName: z.string().describe("The full name of the property owner."),
    registrationNumber: z.string().describe("The official registration number of the property."),
    plotArea: z.number().optional().describe("The total area of the plot in square meters."),
    summary: z.string().describe("A one-sentence summary of the document's nature."),
    confidenceScore: z.number().describe("A confidence score (0-100) on the document's authenticity."),
    redFlags: z.array(z.string()).describe("A list of observed potential issues or red flags."),
});
export type AnalyzePropertyDocumentOutput = z.infer<typeof AnalyzePropertyDocumentOutputSchema>;


export const GenerateLocationSketchInputSchema = z.object({
  croqui: PointOfInterestSchema,
});
export type GenerateLocationSketchInput = z.infer<typeof GenerateLocationSketchInputSchema>;

export const GenerateLocationSketchOutputSchema = z.object({
  sketchHtml: z.string().describe("The full HTML content of the generated location sketch."),
});
export type GenerateLocationSketchOutput = z.infer<typeof GenerateLocationSketchOutputSchema>;

export const SuggestionSchema = z.object({
  technicianId: z.string(),
  rank: z.number(),
  reason: z.string(),
});
export type Suggestion = z.infer<typeof SuggestionSchema>;

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
        skills: z.array(z.string()),
        taskQueueSize: z.number(),
        team: z.enum(['Saneamento', 'Eletricidade', 'Geral']).optional(),
    })),
    assignedTeam: z.enum(['Saneamento', 'Eletricidade', 'Geral']).optional().describe("The specific team assigned to the geofence where the task is located."),
});
export type SuggestTechnicianInput = z.infer<typeof SuggestTechnicianInputSchema>;

export const SuggestTechnicianOutputSchema = z.object({
    suggestions: z.array(SuggestionSchema),
});
export type SuggestTechnicianOutput = z.infer<typeof SuggestTechnicianOutputSchema>;

export const PredictMaintenanceInputSchema = z.object({
    input: z.object({
        vehicleType: z.string().describe("The type of vehicle (e.g., 'Carrinha de Manutenção', 'Carro de Patrulha')."),
        mileage: z.number().describe("The current odometer reading in kilometers."),
        ageInYears: z.number().describe("The age of the vehicle in years."),
        telemetryEvents: z.array(z.string()).describe("A list of recent driving events (e.g., 'Travagem Brusca', 'Aceleração Brusca')."),
    })
});
export type PredictMaintenanceInput = z.infer<typeof PredictMaintenanceInputSchema>;

export const PredictMaintenanceOutputSchema = z.object({
    predictions: z.array(z.object({
        taskDescription: z.string().describe("A clear description of the predicted maintenance task."),
        reason: z.string().describe("The justification for the prediction based on the input data."),
        priority: PointOfInterestPriorityEnum.describe("The priority of the maintenance task ('low', 'medium', 'high')."),
    })),
});
export type PredictMaintenanceOutput = z.infer<typeof PredictMaintenanceOutputSchema>;
