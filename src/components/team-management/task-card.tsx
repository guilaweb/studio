
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
        'full': <Badge className="bg-orange-500 text-white">Pendente</Badge>,
        // Add other statuses as needed
    };
    
    // Simulating the "Em Rota" status locally since it's a technician state, not a task state
    const [isEnRoute, setIsEnRoute] = useState(false);

    const handleAccept = () => {
        setIsEnRoute(true);
        toast({ title: "Tarefa Aceite!", description: `A navegar para: ${task.title}` });
    };

    const handleArrive = () => {
        setIsEnRoute(false);
        onStatusChange(task.id, 'in_progress');
    };

    const handleComplete = () => {
        onStatusChange(task.id, 'collected');
        toast({ title: "Tarefa Concluída!", description: `${task.title}` });
    };

    const currentStatus = isEnRoute ? 'Em Rota' : (task.status || 'unknown');

    const statusBadgeMap = {
        'unknown': <Badge variant="outline">Pendente</Badge>,
        'in_progress': <Badge className="bg-blue-500 text-white">No Local</Badge>,
        'collected': <Badge className="bg-green-500 text-white">Concluída</Badge>,
        'full': <Badge className="bg-orange-500 text-white">Pendente (Cheio)</Badge>,
        'Em Rota': <Badge className="bg-orange-500 text-white">Em Rota</Badge>,
    }

    return (
        <Collapsible>
            <Card>
                <div className="flex items-center p-4">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                             {task.priority && <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>}
                             {statusBadgeMap[currentStatus as keyof typeof statusBadgeMap] || <Badge variant="secondary">{currentStatus}</Badge>}
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
                            {currentStatus !== 'Em Rota' && currentStatus !== 'in_progress' && currentStatus !== 'collected' && (
                                <Button onClick={handleAccept}>
                                    <Play className="mr-2 h-4 w-4"/> Aceitar e Navegar
                                </Button>
                            )}
                            {currentStatus === 'Em Rota' && (
                                <Button onClick={handleArrive}>
                                    <CheckCircle className="mr-2 h-4 w-4"/> Cheguei ao Local
                                </Button>
                            )}
                             {currentStatus === 'in_progress' && (
                                <Button onClick={handleComplete}>
                                    <CheckCircle className="mr-2 h-4 w-4"/> Concluir Tarefa
                                </Button>
                            )}
                            <Button variant="outline"><Compass className="mr-2 h-4 w-4"/> Ver Mapa</Button>
                            <Button variant="outline"><FileText className="mr-2 h-4 w-4"/> Anexos</Button>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
