
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, DollarSign, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PointOfInterest } from "@/lib/data";
import { columns } from "@/components/admin/iluminacao-publica/analise-custos/columns";
import { DataTable } from "@/components/admin/iluminacao-publica/analise-custos/data-table";

export interface AssetCost {
    id: string;
    title: string;
    type: string;
    totalRepairs: number;
    totalPartsCost: number;
    totalLaborCost: number;
    totalCost: number;
}

function LightingCostAnalysisPage() {
    const { allData, loading } = usePoints();

    const assetCosts = React.useMemo(() => {
        const maintenanceIncidents = allData.filter(p => p.type === 'incident' && p.maintenanceId);
        
        const costsByAsset: Record<string, AssetCost> = {};

        for (const incident of maintenanceIncidents) {
            const assetId = incident.maintenanceId!;
            
            if (!costsByAsset[assetId]) {
                 const asset = allData.find(a => a.id === assetId);
                 if (asset) {
                     costsByAsset[assetId] = {
                        id: asset.id,
                        title: asset.title,
                        type: asset.type,
                        totalRepairs: 0,
                        totalPartsCost: 0,
                        totalLaborCost: 0,
                        totalCost: 0,
                    };
                 }
            }
            
            if (costsByAsset[assetId]) {
                costsByAsset[assetId].totalRepairs += 1;
                costsByAsset[assetId].totalPartsCost += incident.partsCost || 0;
                costsByAsset[assetId].totalLaborCost += incident.laborCost || 0;
                costsByAsset[assetId].totalCost += (incident.partsCost || 0) + (incident.laborCost || 0);
            }
        }
        
        return Object.values(costsByAsset).sort((a, b) => b.totalCost - a.totalCost);

    }, [allData]);
    
    const totalCost = React.useMemo(() => assetCosts.reduce((sum, asset) => sum + asset.totalCost, 0), [assetCosts]);
    
    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center">A carregar dados de custos...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/admin/iluminacao-publica">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Análise de Custos de Manutenção
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Ativos com Manutenção</CardTitle><Wrench className="h-4 w-4 text-muted-foreground"/></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{assetCosts.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Custo Total de Manutenção</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader>
                        <CardContent><div className="text-2xl font-bold">AOA {totalCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div></CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Custos de Manutenção por Ativo</CardTitle>
                        <CardDescription>
                            Análise dos custos acumulados de peças e mão-de-obra para cada ativo reparado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={assetCosts} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(LightingCostAnalysisPage, ['Agente Municipal', 'Administrador', 'Super Administrador']);
