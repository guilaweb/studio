
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { usePoints } from "@/hooks/use-points";
import { Layer, PointOfInterest } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { pt } from 'date-fns/locale';
import { APIProvider } from "@vis.gl/react-google-maps";
import DashboardMap from "@/components/dashboard/dashboard-map";
import IntelligentAlerts from "@/components/dashboard/intelligent-alerts";
import { getIncidentClusters, IncidentClusterAlert } from "@/services/alert-service";


const chartConfig = {
  reports: {
    label: "Reportes",
  },
  incident: {
    label: "Incidentes",
    color: "hsl(var(--accent))",
  },
  construction: {
    label: "Obras",
    color: "hsl(var(--secondary))",
  },
  atm: {
    label: "ATMs",
    color: "hsl(var(--primary))",
  },
  sanitation: {
    label: "Saneamento",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const getMockKPIs = (data: PointOfInterest[]) => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newReports = data.filter(p => {
        const reportDate = p.updates?.[p.updates.length-1]?.timestamp || p.lastReported;
        return reportDate && new Date(reportDate) > twentyFourHoursAgo;
    });

    const resolvedSanitation = data.filter(p => p.type === 'sanitation' && p.status === 'collected');
    const totalSanitation = data.filter(p => p.type === 'sanitation');
    const resolutionRate = totalSanitation.length > 0 ? (resolvedSanitation.length / totalSanitation.length) * 100 : 0;
    
    // Mock TMR
    const avgResolutionTime = "1d 4h"; 

    const activeReports = data.filter(p => p.status !== 'collected').length;

    return {
        newReportsCount: newReports.length,
        avgResolutionTime,
        resolutionRate: resolutionRate.toFixed(0),
        activeReports,
    }

}

const RecentActivityFeed = ({ data }: { data: PointOfInterest[] }) => {
    const recentPoints = data
        .sort((a, b) => {
            const dateA = a.lastReported ? new Date(a.lastReported).getTime() : 0;
            const dateB = b.lastReported ? new Date(b.lastReported).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Os últimos reportes e atualizações dos cidadãos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentPoints.map(point => (
                        <div key={point.id} className="flex items-center gap-4">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                           </div>
                           <div className="flex-1">
                               <p className="text-sm font-medium leading-none">{point.title}</p>
                               <p className="text-sm text-muted-foreground">{`Reportado ${point.lastReported ? formatDistanceToNow(new Date(point.lastReported), { addSuffix: true, locale: pt}) : 'recentemente'}`}</p>
                           </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
  const { allData } = usePoints();
  const router = useRouter();

  const kpis = React.useMemo(() => getMockKPIs(allData), [allData]);
  
  const incidentClusters = React.useMemo(() => getIncidentClusters(allData), [allData]);

  const chartData = React.useMemo(() => {
    const counts = allData.reduce((acc, point) => {
      acc[point.type] = (acc[point.type] || 0) + 1;
      return acc;
    }, {} as Record<Layer, number>);

    return Object.entries(counts).map(([name, total]) => ({
      name: chartConfig[name as Layer]?.label || name,
      total,
      fill: `var(--color-${name})`,
    }));
  }, [allData]);

  const handleViewOnMap = (poiId: string) => {
    router.push(`/?poi=${poiId}`);
  };

  const heatmapData = React.useMemo(() => allData.map(p => p.position), [allData]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Button size="icon" variant="outline" asChild>
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Voltar ao Mapa</span>
                </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Painel Municipal
            </h1>
        </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Novos Reportes (24h)</CardDescription>
                        <CardTitle className="text-4xl">{kpis.newReportsCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Atualizado em tempo real
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Tempo Médio de Resolução</CardDescription>
                        <CardTitle className="text-4xl">{kpis.avgResolutionTime}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Baseado em reportes de saneamento
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Taxa de Resolução</CardDescription>
                        <CardTitle className="text-4xl">{kpis.resolutionRate}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Baseado em reportes de saneamento
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total de Reportes Ativos</CardDescription>
                        <CardTitle className="text-4xl">{kpis.activeReports}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Exclui itens já resolvidos
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle>Mapa Operacional (Pontos Quentes)</CardTitle>
                        <CardDescription>
                            Visualização da densidade de reportes na cidade.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] p-0">
                        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                           <DashboardMap data={heatmapData} />
                        </APIProvider>
                    </CardContent>
                </Card>

                <div className="grid auto-rows-max items-start gap-4">
                    <IntelligentAlerts alerts={incidentClusters} onViewOnMap={handleViewOnMap} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Visão Geral dos Reportes</CardTitle>
                            <CardDescription>
                            Número total por categoria.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-2">
                            <ChartContainer config={chartConfig} className="h-[150px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} accessibilityLayer layout="vertical">
                                <CartesianGrid horizontal={false} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    className="text-xs"
                                />
                                <XAxis 
                                    type="number"
                                    hide
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar dataKey="total" layout="vertical" radius={5} />
                                </BarChart>
                            </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <RecentActivityFeed data={allData} />
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Todos os Reportes</CardTitle>
                    <CardDescription>
                        Veja, filtre e gira todos os pontos de interesse reportados pelos cidadãos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={allData} onViewOnMap={handleViewOnMap} />
                </CardContent>
            </Card>
        </div>

      </main>
    </div>
  );
}
