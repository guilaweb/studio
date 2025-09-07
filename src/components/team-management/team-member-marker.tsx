
      
"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMemberMarkerProps {
  name: string;
  photoURL?: string | null;
  status: 'Disponível' | 'Em Rota' | 'Ocupado' | 'Offline';
}

const statusColors = {
    'Disponível': 'border-green-500',
    'Em Rota': 'border-orange-500',
    'Ocupado': 'border-red-500',
    'Offline': 'border-gray-400',
};

export const TeamMemberMarker: React.FC<TeamMemberMarkerProps> = ({ name, photoURL, status }) => {
    const fallback = name ? name.charAt(0).toUpperCase() : 'U';
    const borderColorClass = statusColors[status] || 'border-gray-400';

    return (
        <div className="relative">
            <Avatar className={`h-10 w-10 border-4 ${borderColorClass} shadow-lg`}>
                <AvatarImage src={photoURL || undefined} alt={name} />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
        </div>
    );
};

    