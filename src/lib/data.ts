
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
