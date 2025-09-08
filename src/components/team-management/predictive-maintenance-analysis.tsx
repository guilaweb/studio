
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Wrench, AlertTriangle, ArrowRight, ArrowDown } from 'lucide-react';
import { PredictMaintenanceOutput, UserProfile } from '@/lib/data';
import { predictMaintenanceFlow } from '@/ai/flows/predict-maintenance-flow';
import { Badge } from '../ui/badge';


interface PredictiveMaintenanceAnalysisProps {
    user: UserProfile;
}

const priorityConfig = {
    high: { icon: AlertTriangle, color: "text-red-500", label: "Alta" },
    medium: { icon: ArrowRight, color: "text-yellow-500", label: "Média" },
    low: { icon: ArrowDown, color: "text-green-500", label: "Baixa" },
};


const PredictiveMaintenanceAnalysis: React.FC<PredictiveMaintenanceAnalysisProps> = ({ user }) => {
    const [analysis, setAnalysis] = useState<PredictMaintenanceOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!user.vehicle) {
            setLoading(false);
            return;
        }

        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                // Mocking telemetry data for now
                const mockTelemetry = ['Travagem Brusca', 'Aceleração Brusca', 'Excesso de Velocidade'];

                const result = await predictMaintenanceFlow({
                    vehicleType: user.vehicle!.type,
                    mileage: user.vehicle!.odometer || 0,
                    ageInYears: 5, // Placeholder, could be calculated from a registration date
                    telemetryEvents: mockTelemetry,
                });
                setAnalysis(result);
            } catch (error) {
                console.error("Failed to fetch predictive maintenance analysis:", error);
                toast({
                    variant: "destructive",
                    title: "Erro de IA Preditiva",
                    description: "Não foi possível obter as previsões de manutenção.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [user, toast]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Manutenção Preditiva (IA)</CardTitle>
                        <CardDescription>
                            Previsão de potenciais falhas e necessidades de manutenção com base nos dados operacionais do veículo.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : !analysis || analysis.predictions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma previsão de manutenção para este veículo de momento.</p>
                ) : (
                    <div className="space-y-4">
                        {analysis.predictions.map((prediction, index) => {
                            const config = priorityConfig[prediction.priority];
                            return (
                                <div key={index} className="flex items-start gap-4 p-3 border rounded-lg bg-background group">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}/10 flex-shrink-0`}>
                                        <Wrench className={`h-5 w-5 ${config.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{prediction.taskDescription}</p>
                                            <Badge variant={prediction.priority === 'high' ? 'destructive' : 'secondary'} className="hidden sm:inline-flex">{config.label}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{prediction.reason}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PredictiveMaintenanceAnalysis;

    
