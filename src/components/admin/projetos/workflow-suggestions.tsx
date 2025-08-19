
"use client";

import React, { useEffect, useState } from 'react';
import { PointOfInterest, SuggestNextStepsOutput } from '@/lib/data';
import { suggestNextSteps } from '@/ai/flows/suggest-next-steps-flow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, GitBranch } from 'lucide-react';

interface WorkflowSuggestionsProps {
    project: PointOfInterest;
}

const WorkflowSuggestions: React.FC<WorkflowSuggestionsProps> = ({ project }) => {
    const [suggestions, setSuggestions] = useState<SuggestNextStepsOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!project) return;
            setLoading(true);
            try {
                const result = await suggestNextSteps({
                    projectType: project.projectType,
                    projectDescription: project.description,
                    usageType: project.usageType,
                });
                setSuggestions(result);
            } catch (error) {
                console.error("Failed to fetch workflow suggestions:", error);
                toast({
                    variant: "destructive",
                    title: "Erro de IA",
                    description: "Não foi possível obter as sugestões de fluxo de trabalho.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [project, toast]);

    const getStatusIcon = (status: 'pending' | 'completed' | 'not_required') => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'pending':
                return <Circle className="h-5 w-5 text-yellow-500 animate-pulse" />;
            default:
                return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <GitBranch className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Fluxo de Trabalho Sugerido (IA)</CardTitle>
                        <CardDescription>
                            Passos e pareceres recomendados com base nas características do projeto.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-4/5" />
                    </div>
                ) : !suggestions || suggestions.steps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Não foram necessárias sugestões de encaminhamento adicionais para este tipo de projeto.</p>
                ) : (
                    <div className="space-y-4">
                        {suggestions.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 border rounded-lg bg-background">
                                {getStatusIcon(step.status)}
                                <div className="flex-1">
                                    <p className="font-semibold">{step.department}</p>
                                    <p className="text-sm text-muted-foreground">{step.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WorkflowSuggestions;

    