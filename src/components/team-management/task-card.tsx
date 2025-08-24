
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, FileText, CheckCircle, Play, MoreVertical, ChevronsUpDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { PointOfInterest } from '@/lib/data';

// Task is now a PointOfInterest
export type Task = PointOfInterest;

interface TaskCardProps {
    task: Task;
    onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
    const { toast } = useToast();

    const priorityVariant = {
        'high': 'destructive',
        'medium': 'default',
        'low': 'secondary',
    } as const;

    const statusBadge = {
        'unknown': <Badge variant="outline">Pendente</Badge>,
        'in_progress': <Badge className="bg-blue-500 text-white">No Local</Badge>,
        'collected': <Badge className="bg-green-500 text-white">Concluída</Badge>,
        'full': <Badge className="bg-orange-500 text-white">Pendente (Cheio)</Badge>,
    };
    
    const handleComplete = () => {
        onStatusChange(task.id, 'collected');
        toast({ title: "Tarefa Concluída!", description: `${task.title}` });
    };

    return (
        <Collapsible>
            <Card>
                <div className="flex items-center p-4">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                             {task.priority && <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>}
                             {statusBadge[task.status as keyof typeof statusBadge] || <Badge variant="secondary">{task.status}</Badge>}
                        </div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description?.substring(0, 50)}...</p>
                    </div>
                     <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            Ver Detalhes
                            <ChevronsUpDown className="h-4 w-4 ml-2" />
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 px-4 space-y-4">
                        <div className="p-3 rounded-md bg-muted text-sm">
                            <p className="font-semibold text-xs text-muted-foreground mb-1">Detalhes da Tarefa</p>
                            {task.description}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {task.status !== 'collected' && (
                                <Button onClick={handleComplete}>
                                    <CheckCircle className="mr-2 h-4 w-4"/> Marcar como Concluída
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <a href={`https://www.google.com/maps/dir/?api=1&destination=${task.position.lat},${task.position.lng}`} target="_blank" rel="noopener noreferrer">
                                    <Compass className="mr-2 h-4 w-4"/> Navegar
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
