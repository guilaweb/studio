
      
"use client";

import React from 'react';
import { Car } from 'lucide-react';

interface TeamMemberMarkerProps {
  name: string;
  photoURL?: string | null;
  status: 'Disponível' | 'Em Rota' | 'Ocupado' | 'Offline';
}

const statusClasses = {
    'Disponível': { border: 'border-green-500', icon: 'text-green-600', bg: 'bg-green-100' },
    'Em Rota': { border: 'border-orange-500', icon: 'text-orange-600', bg: 'bg-orange-100' },
    'Ocupado': { border: 'border-red-500', icon: 'text-red-600', bg: 'bg-red-100' },
    'Offline': { border: 'border-gray-400', icon: 'text-gray-500', bg: 'bg-gray-100' },
};

export const TeamMemberMarker: React.FC<TeamMemberMarkerProps> = ({ name, photoURL, status }) => {
    const classes = statusClasses[status] || statusClasses['Offline'];

    return (
        <div className={`relative flex items-center justify-center h-10 w-10 rounded-full border-4 shadow-lg ${classes.border} ${classes.bg}`}>
            <Car className={`h-5 w-5 ${classes.icon}`} />
        </div>
    );
};

    

    
