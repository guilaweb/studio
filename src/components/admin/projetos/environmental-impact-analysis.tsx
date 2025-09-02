
"use client";

import React, { useEffect, useState } from 'react';
import { PointOfInterest, AnalyzeEnvironmentalImpactOutput } from '@/lib/data';
import { analyzeEnvironmentalImpactFlow } from '@/ai/flows/analyze-environmental-impact-flow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Droplets, Sun, Wind, Leaf } from 'lucide-react';

interface EnvironmentalImpactAnalysisProps {
    project: PointOfInterest;
}

const EnvironmentalImpactAnalysis: React.FC<EnvironmentalImpactAnalysisProps> = ({ project }) => {
    const [analysis, setAnalysis] = useState<AnalyzeEnvironmentalImpactOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!project.description) {
                setLoading(false);
                return;
            };
            setLoading(true);
            try {
                const result = await analyzeEnvironmentalImpactFlow({
                    projectDescription: project.description,
                    projectType: project.projectType,
                    area: project.area,
                });
                setAnalysis(result);
            } catch (error) {
                console.error("Failed to fetch environmental analysis:", error);
                toast({
                    variant: "destructive",
                    title: "Erro de IA",
                    description: "Não foi possível obter a análise de impacto ambiental.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [project, toast]);

    const AnalysisItem = ({ icon: Icon, title, text }: { icon: React.ElementType, title: string, text: string }) => (
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                 <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
                <h4 className="font-semibold text-green-800 dark:text-green-300">{title}</h4>
                <p className="text-sm text-muted-foreground">{text}</p>
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <CardTitle>Análise de Sustentabilidade (IA)</CardTitle>
                        <CardDescription>
                            Sugestões para um projeto mais ecológico e sustentável.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-4/5" />
                    </div>
                ) : !analysis ? (
                    <p className="text-sm text-muted-foreground">Não foi possível gerar uma análise para este projeto.</p>
                ) : (
                    <div className="space-y-6">
                        <AnalysisItem icon={Droplets} title="Drenagem e Gestão de Águas" text={analysis.drainageAnalysis} />
                        <AnalysisItem icon={Sun} title="Mitigação do Efeito Ilha de Calor" text={analysis.heatIslandAnalysis} />
                        <AnalysisItem icon={Wind} title="Eficiência Energética e Ventilação" text={analysis.energyEfficiencyAnalysis} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EnvironmentalImpactAnalysis;

    