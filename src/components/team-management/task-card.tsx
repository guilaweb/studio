
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, FileText, CheckCircle, Play, MoreVertical, ChevronsUpDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

export type Task = {
    id: string;
    title: string;
    status: 'Pendente' | 'Em Rota' | 'No Local' | 'Concluída';
    location: string;
    priority: 'Alta' | 'Média' | 'Baixa';
    deadline: string;
    details: string;
};

interface TaskCardProps {
    task: Task;
    onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
    const { toast } = useToast();

    const priorityVariant = {
        'Alta': 'destructive',
        'Média': 'default',
        'Baixa': 'secondary'
    } as const;

    const statusBadge = {
        'Pendente': <Badge variant="outline">Pendente</Badge>,
        'Em Rota': <Badge className="bg-orange-500 text-white">Em Rota</Badge>,
        'No Local': <Badge className="bg-blue-500 text-white">No Local</Badge>,
        'Concluída': <Badge className="bg-green-500 text-white">Concluída</Badge>
    };

    const handleAccept = () => {
        onStatusChange(task.id, 'Em Rota');
        toast({ title: "Tarefa Aceite!", description: `A navegar para: ${task.title}` });
    };

    const handleArrive = () => {
        onStatusChange(task.id, 'No Local');
    };

    const handleComplete = () => {
        onStatusChange(task.id, 'Concluída');
        toast({ title: "Tarefa Concluída!", description: `${task.title}` });
    };

    return (
        <Collapsible>
            <Card>
                <div className="flex items-center p-4">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                             <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                             {statusBadge[task.status]}
                        </div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.location}</p>
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
                            {task.details}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {task.status === 'Pendente' && (
                                <Button onClick={handleAccept}>
                                    <Play className="mr-2 h-4 w-4"/> Aceitar e Navegar
                                </Button>
                            )}
                            {task.status === 'Em Rota' && (
                                <Button onClick={handleArrive}>
                                    <CheckCircle className="mr-2 h-4 w-4"/> Cheguei ao Local
                                </Button>
                            )}
                            {task.status === 'No Local' && (
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
