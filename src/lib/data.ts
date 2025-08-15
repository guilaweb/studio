export type PointOfInterest = {
  id: string;
  type: 'atm' | 'construction' | 'incident';
  position: { lat: number; lng: number };
  title: string;
  description: string;
};

export type Layer = 'atm' | 'construction' | 'incident';

export type ActiveLayers = {
  [key in Layer]: boolean;
};


// Mock data for São Paulo
export const atms: PointOfInterest[] = [
  {
    id: 'atm-1',
    type: 'atm',
    position: { lat: -23.5506, lng: -46.6333 },
    title: 'ATM Praça da Sé',
    description: 'Caixa Eletrônico 24h no centro da praça.',
  },
  {
    id: 'atm-2',
    type: 'atm',
    position: { lat: -23.5469, lng: -46.6339 },
    title: 'ATM Rua Boa Vista',
    description: 'Localizado dentro da agência bancária.',
  },
  {
    id: 'atm-3',
    type: 'atm',
    position: { lat: -23.5614, lng: -46.6563 },
    title: 'ATM Av. Paulista',
    description: 'Próximo à estação de metrô Trianon-Masp.',
  },
];

export const constructionSites: PointOfInterest[] = [
  {
    id: 'construction-1',
    type: 'construction',
    position: { lat: -23.553, lng: -46.636 },
    title: 'Reforma do Viaduto do Chá',
    description: 'Previsão de término: Dezembro 2024. Trânsito pode estar lento na região.',
  },
  {
    id: 'construction-2',
    type: 'construction',
    position: { lat: -23.548, lng: -46.64 },
    title: 'Construção de nova estação de metrô',
    description: 'Linha 6-Laranja. Espere ruído e poeira durante o dia.',
  },
];

export const incidents: PointOfInterest[] = [
  {
    id: 'incident-1',
    type: 'incident',
    position: { lat: -23.551, lng: -46.634 },
    title: 'Semáforo quebrado',
    description: 'Cruzamento da Rua Direita com a Rua São Bento. Cuidado redobrado.',
  },
  {
    id: 'incident-2',
    type: 'incident',
    position: { lat: -23.56, lng: -46.65 },
    title: 'Acidente na Av. 9 de Julho',
    description: 'Colisão entre dois carros, faixa da direita bloqueada.',
  },
];
