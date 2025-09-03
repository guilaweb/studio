
"use client";

import React, { useEffect, useState } from 'react';
import { PointOfInterest, WorkflowStep } from '@/lib/data';
import { suggestNextSteps } from '@/ai/flows/suggest-next-steps-flow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, GitBranch, PlusCircle, Trash2, X, Loader2 } from 'lucide-react';
import { usePoints } from '@/hooks/use-points';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WorkflowSuggestionsProps {
    project: PointOfInterest;
}

const WorkflowSuggestions: React.FC<WorkflowSuggestionsProps> = ({ project }) => {
    const { updatePointDetails } = usePoints();
    const [steps, setSteps] = useState<WorkflowStep[]>(project.workflowSteps || []);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [newDepartment, setNewDepartment] = useState('');
    const [newReason, setNewReason] = useState('');

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (project.workflowSteps && project.workflowSteps.length > 0) {
                setSteps(project.workflowSteps);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const result = await suggestNextSteps({
                    projectType: project.projectType,
                    projectDescription: project.description,
                    usageType: project.usageType,
                });
                const stepsWithIds = result.steps.map(s => ({ ...s, id: `step-${Math.random()}`}));
                setSteps(stepsWithIds);
                // Persist initial suggestions to Firestore
                await updatePointDetails(project.id, { workflowSteps: stepsWithIds });
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
    }, [project, toast, updatePointDetails]);

    const handleUpdateSteps = async (updatedSteps: WorkflowStep[]) => {
        setSteps(updatedSteps);
        await updatePointDetails(project.id, { workflowSteps: updatedSteps });
    };

    const handleToggleStatus = (stepId: string) => {
        const updatedSteps = steps.map(step => {
            if (step.id === stepId) {
                return { ...step, status: step.status === 'pending' ? 'completed' : 'pending' };
            }
            return step;
        });
        handleUpdateSteps(updatedSteps);
    };
    
    const handleRemoveStep = (stepId: string) => {
        const updatedSteps = steps.filter(step => step.id !== stepId);
        handleUpdateSteps(updatedSteps);
    }

    const handleAddStep = () => {
        if (!newDepartment || !newReason) {
            toast({ variant: 'destructive', title: 'Campos em falta', description: 'Preencha o departamento e a justificação.'});
            return;
        }
        const newStep: WorkflowStep = {
            id: `step-manual-${Date.now()}`,
            department: newDepartment,
            reason: newReason,
            status: 'pending',
        };
        handleUpdateSteps([...steps, newStep]);
        setNewDepartment('');
        setNewReason('');
    };

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
            <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <GitBranch className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Fluxo de Trabalho do Processo</CardTitle>
                        <CardDescription>
                            Gira os pareceres necessários para a aprovação do projeto.
                        </CardDescription>
                    </div>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Adicionar Passo</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Adicionar Passo Manual</AlertDialogTitle>
                            <AlertDialogDescription>
                                Insira um novo parecer ou etapa de verificação ao fluxo de trabalho do projeto.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                             <div className="space-y-2">
                                <Label htmlFor="new-department">Departamento</Label>
                                <Input id="new-department" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} placeholder="Ex: Departamento Jurídico"/>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="new-reason">Justificação</Label>
                                <Input id="new-reason" value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="Ex: Verificação da titularidade"/>
                             </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleAddStep}>Adicionar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-4/5" />
                    </div>
                ) : !steps || steps.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum passo de fluxo de trabalho definido. Adicione um passo manualmente.</p>
                ) : (
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-start gap-4 p-3 border rounded-lg bg-background group">
                                <button onClick={() => handleToggleStatus(step.id)} aria-label={`Mudar estado de ${step.department}`}>
                                    {getStatusIcon(step.status)}
                                </button>
                                <div className="flex-1">
                                    <p className="font-semibold">{step.department}</p>
                                    <p className="text-sm text-muted-foreground">{step.reason}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveStep(step.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WorkflowSuggestions;
