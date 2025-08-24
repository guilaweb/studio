
"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Award } from 'lucide-react';

interface SuggestionBadgeProps {
  rank: number;
}

export const SuggestionBadge: React.FC<SuggestionBadgeProps> = ({ rank }) => {
  const badgeStyle = {
    1: 'bg-yellow-400 text-yellow-900 border-yellow-500',
    2: 'bg-slate-300 text-slate-800 border-slate-400',
    3: 'bg-orange-300 text-orange-800 border-orange-400',
  }[rank] || 'bg-gray-200 text-gray-800 border-gray-400';

  return (
    <div className="absolute -top-2 -right-3 z-10">
      <Badge className={`flex items-center gap-1 text-xs font-bold ${badgeStyle}`}>
        <Award className="h-3 w-3" />
        {rank}º
      </Badge>
    </div>
  );
};
