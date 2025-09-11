
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { PointOfInterest, DashboardStats } from '@/lib/data';
import { Wand2 } from 'lucide-react';
import { generateDashboardSummary } from '@/ai/flows/generate-dashboard-summary-flow';
import { getIntelligentAlerts } from '@/services/alert-service';

interface IntelligentSummaryProps {
    allData: PointOfInterest[];
}

const getDashboardStats = (allData: PointOfInterest[]): DashboardStats | null => {
    if (!allData || allData.length === 0) return null;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newIncidents = allData.filter(p => 
        p.type === 'incident' && 
        p.lastReported &&
        new Date(p.lastReported) > twentyFourHoursAgo
    );

    const sanitationPoints = allData.filter(p => p.type === 'sanitation');
    const resolvedSanitation = sanitationPoints.filter(p => p.status === 'collected');
    const fullContainers = sanitationPoints.filter(p => p.status === 'full').length;
    const resolutionRate = sanitationPoints.length > 0 ? (resolvedSanitation.length / sanitationPoints.length) * 100 : 0;
    
    const newConstructionUpdates = allData.filter(p => 
        p.type === 'construction' && 
        p.updates &&
        p.updates.some(u => new Date(u.timestamp) > twentyFourHoursAgo)
    ).length;
    
    const incidentClusters = getIntelligentAlerts(allData).filter(a => a.type === 'cluster').length;

    return {
        totalPoints: allData.length,
        newIncidentsCount: newIncidents.length,
        incidentClustersCount: incidentClusters,
        sanitationResolutionRate: parseFloat(resolutionRate.toFixed(1)),
        fullContainersCount: fullContainers,
        newConstructionUpdatesCount: newConstructionUpdates,
    };
}


const IntelligentSummary: React.FC<IntelligentSummaryProps> = ({ allData }) => {
    const [summary, setSummary] = React.useState<string>("");
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchSummary = async () => {
            const stats = getDashboardStats(allData);

            if (!stats) {
                setSummary("Ainda não existem dados suficientes para gerar um sumário.");
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const result = await generateDashboardSummary({ 
                    stats: stats
                });
                setSummary(result.summary);
            } catch (error: any) {
                console.error("Error generating summary:", error);
                const errorMessage = "Não foi possível gerar o sumário executivo.";
                
                if (error.message && (error.message.includes('503') || error.message.includes('429'))) {
                    setSummary(`${errorMessage} O serviço de IA parece estar sobrecarregado.`);
                     toast({
                        variant: "destructive",
                        title: "Serviço de IA Indisponível",
                        description: "O modelo de IA está sobrecarregado. Por favor, tente novamente mais tarde.",
                    });
                } else {
                     setSummary(`${errorMessage} Por favor, tente recarregar a página.`);
                     toast({
                        variant: "destructive",
                        title: "Erro de IA",
                        description: "Houve um problema ao gerar o sumário do painel.",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [allData, toast]);


    return (
        <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
            <CardHeader>
                <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Wand2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-primary">Sumário Executivo IA</CardTitle>
                        <CardDescription className="text-primary/80">
                            Uma análise automática dos dados mais recentes da cidade.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[80%]" />
                    </div>
                ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{summary}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default IntelligentSummary;
