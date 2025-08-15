export type PointOfInterest = {
  id: string;
  type: 'atm' | 'construction' | 'incident';
  position: { lat: number; lng: number };
  title: string;
  description: string;
  status?: 'available' | 'unavailable' | 'unknown'; // For ATMs
  lastReported?: string; // For ATMs
};

export type Layer = 'atm' | 'construction' | 'incident';

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
    lastReported: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  },
  {
    id: 'atm-2',
    type: 'atm',
    position: { lat: -8.8145, lng: 13.2309 },
    title: 'ATM Baía de Luanda',
    description: 'Localizado dentro do shopping.',
    status: 'unavailable',
    lastReported: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: 'atm-3',
    type: 'atm',
    position: { lat: -8.8118, lng: 13.2355 },
    title: 'ATM Av. Comandante Valódia',
    description: 'Próximo ao Hospital Josina Machel.',
    status: 'unknown',
    lastReported: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

export const constructionSites: PointOfInterest[] = [
  {
    id: 'construction-1',
    type: 'construction',
    position: { lat: -8.83, lng: 13.24 },
    title: 'Reabilitação da Avenida 4 de Fevereiro',
    description: 'Entidade: Administração Municipal de Luanda.\nEstado: Em curso.\nPrevisão de término: Final de 2024.\n\nObservações: Trânsito condicionado nos horários de pico.',
  },
  {
    id: 'construction-2',
    type: 'construction',
    position: { lat: -8.851, lng: 13.269 },
    title: 'Construção do novo viaduto do Zango',
    description: 'Entidade: Governo Provincial de Luanda.\nEstado: Em curso.\n\nObservações: Espere ruído e poeira durante o dia. Desvios sinalizados na área.',
  },
  {
    id: 'construction-3',
    type: 'construction',
    position: { lat: -8.87, lng: 13.22 },
    title: 'Limpeza e Desassoreamento da Vala do Prenda',
    description: 'Entidade: Ministério das Obras Públicas.\nEstado: Planeada.\nInício previsto: Próximo trimestre.',
  }
];

export const incidents: PointOfInterest[] = [
  {
    id: 'incident-1',
    type: 'incident',
    position: { lat: -8.816, lng: 13.232 },
    title: 'Semáforo avariado',
    description: 'Cruzamento da Av. de Portugal com a Rua Rainha Ginga. Cuidado redobrado ao atravessar. #falta-de-sinalização',
  },
  {
    id: 'incident-2',
    type: 'incident',
    position: { lat: -8.825, lng: 13.245 },
    title: 'Acidente na Av. Ho Chi Minh',
    description: 'Colisão entre dois carros, faixa da direita bloqueada. Trânsito lento no local. #acidente',
  },
];
