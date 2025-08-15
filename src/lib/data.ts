
export type PointOfInterestUpdate = {
  id: string;
  text: string;
  authorId: string;
  timestamp: string;
  photoDataUri?: string; // For proof of execution
};

export type PointOfInterest = {
  id: string;
  type: 'atm' | 'construction' | 'incident' | 'sanitation';
  position: { lat: number; lng: number };
  title: string;
  description: string;
  status?: 'available' | 'unavailable' | 'unknown' | 'full' | 'damaged' | 'collected' | 'in_progress'; // Added 'in_progress'
  lastReported?: string; // For ATMs and Sanitation
  authorId?: string; // ID of the user who reported it
  updates?: PointOfInterestUpdate[]; // For Construction timeline & Sanitation proof
};

export type Layer = 'atm' | 'construction' | 'incident' | 'sanitation';

export type ActiveLayers = {
  [key in Layer]: boolean;
};


// Mock data for Luanda
export const atms: PointOfInterest[] = [
  {
    id: 'atm-1',
    type: 'atm',
    position: { lat: -8.8385, lng: 13.2312 },
    title: 'ATM Largo do Kinaxixi',
    description: 'Caixa Eletrônico 24h no centro do largo.',
    status: 'available',
    lastReported: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    authorId: 'user-1'
  },
  {
    id: 'atm-2',
    type: 'atm',
    position: { lat: -8.8145, lng: 13.2309 },
    title: 'ATM Baía de Luanda',
    description: 'Localizado dentro do shopping.',
    status: 'unavailable',
    lastReported: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    authorId: 'user-2'
  },
  {
    id: 'atm-3',
    type: 'atm',
    position: { lat: -8.8118, lng: 13.2355 },
    title: 'ATM Av. Comandante Valódia',
    description: 'Próximo ao Hospital Josina Machel.',
    status: 'unknown',
    lastReported: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'user-1'
  },
];

export const constructionSites: PointOfInterest[] = [
  {
    id: 'construction-1',
    type: 'construction',
    position: { lat: -8.83, lng: 13.24 },
    title: 'Reabilitação da Avenida 4 de Fevereiro',
    description: 'Entidade: Administração Municipal de Luanda.\nEstado: Em curso.\nPrevisão de término: Final de 2024.\n\nObservações: Trânsito condicionado nos horários de pico.',
    lastReported: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'user-1',
    updates: [
        { id: 'upd-1-1', text: 'As obras parecem estar paradas há uma semana. Ninguém a trabalhar no local.', authorId: 'user-2', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()},
        { id: 'upd-1-2', text: 'Hoje vi maquinaria pesada a chegar. Parece que vão recomeçar os trabalhos na zona sul da avenida.', authorId: 'user-1', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()},
    ]
  },
  {
    id: 'construction-2',
    type: 'construction',
    position: { lat: -8.851, lng: 13.269 },
    title: 'Construção do novo viaduto do Zango',
    description: 'Entidade: Governo Provincial de Luanda.\nEstado: Em curso.\n\nObservações: Espere ruído e poeira durante o dia. Desvios sinalizados na área.',
    lastReported: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'system',
    updates: []
  },
  {
    id: 'construction-3',
    type: 'construction',
    position: { lat: -8.87, lng: 13.22 },
    title: 'Limpeza e Desassoreamento da Vala do Prenda',
    description: 'Entidade: Ministério das Obras Públicas.\nEstado: Planeada.\nInício previsto: Próximo trimestre.',
    lastReported: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'system',
    updates: []
  }
];

export const incidents: PointOfInterest[] = [
  {
    id: 'incident-1',
    type: 'incident',
    position: { lat: -8.816, lng: 13.232 },
    title: 'Semáforo avariado',
    description: 'Cruzamento da Av. de Portugal com a Rua Rainha Ginga. Cuidado redobrado ao atravessar. #falta-de-sinalização',
    authorId: 'system',
    lastReported: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'incident-2',
    type: 'incident',
    position: { lat: -8.825, lng: 13.245 },
    title: 'Acidente na Av. Ho Chi Minh',
    description: 'Colisão entre dois carros, faixa da direita bloqueada. Trânsito lento no local. #acidente',
    authorId: 'user-2',
    lastReported: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const sanitationPoints: PointOfInterest[] = [
    {
      id: 'sanitation-1',
      type: 'sanitation',
      position: { lat: -8.837, lng: 13.233 },
      title: 'Contentor Rua da Missão',
      description: 'Contentor de lixo de grande capacidade.',
      status: 'collected',
      lastReported: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      authorId: 'user-1'
    },
    {
      id: 'sanitation-2',
      type: 'sanitation',
      position: { lat: -8.812, lng: 13.238 },
      title: 'Ecoponto Josina Machel',
      description: 'Ponto de recolha de lixo próximo ao hospital.',
      status: 'full',
      lastReported: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 minutes ago
      authorId: 'user-2'
    },
  ];

    