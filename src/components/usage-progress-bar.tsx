
"use client";

import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

interface UsageProgressBarProps {
  label: string;
  currentValue: number;
  limit: number;
}

const UsageProgressBar: React.FC<UsageProgressBarProps> = ({ label, currentValue, limit }) => {
    if (limit <= 0) { // Handle unlimited plans
        limit = Infinity;
    }

    const percentage = limit === Infinity ? 0 : Math.min((currentValue / limit) * 100, 100);
    
    const progressColorClass =
        percentage >= 90 ? "[&>div]:bg-destructive"
        : percentage >= 75 ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-primary";

    const limitText = limit === Infinity ? 'Ilimitado' : limit;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <Label className="text-sm">{label}</Label>
                <p className="text-sm font-medium">
                    <span className="font-bold text-lg">{currentValue.toLocaleString('pt-PT')}</span> / {limitText === 'Ilimitado' ? limitText : Number(limitText).toLocaleString('pt-PT')}
                </p>
            </div>
            {limit !== Infinity && <Progress value={percentage} className={cn("h-2", progressColorClass)} />}
        </div>
    );
};

export default UsageProgressBar;
