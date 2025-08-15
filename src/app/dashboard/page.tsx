
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
import { Layer, PointOfInterest, PointOfInterestUpdate } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { useRouter } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import DashboardMap from "@/components/dashboard/dashboard-map";
import IntelligentAlerts from "@/components/dashboard/intelligent-alerts";
import { getIntelligentAlerts } from "@/services/alert-service";
import RecentActivityFeed from "@/components/dashboard/recent-activity-feed";
import IntelligentSummary from "@/components/dashboard/intelligent-summary";
import { withAuth } from "@/hooks/use-auth";
import { formatDistanceStrict } from "date-fns";
import { pt } from "date-fns/locale";


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

const getKPIs = (data: PointOfInterest[]) => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newReports = data.filter(p => {
        const reportDate = p.updates?.[p.updates.length-1]?.timestamp || p.lastReported;
        return reportDate && new Date(reportDate) > twentyFourHoursAgo;
    });

    // --- Sanitation KPIs ---
    const sanitationPoints = data.filter(p => p.type === 'sanitation');
    const resolvedSanitation = sanitationPoints.filter(p => p.status === 'collected');
    const resolutionRate = sanitationPoints.length > 0 ? (resolvedSanitation.length / sanitationPoints.length) * 100 : 0;
    
    const resolutionTimes = resolvedSanitation.reduce((acc, p) => {
        if (!p.updates || p.updates.length < 2) return acc;
        
        const sortedUpdates = [...p.updates].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const creationUpdate = sortedUpdates[0];
        const resolutionUpdate = sortedUpdates.find(u => (u as any).status === 'collected') || sortedUpdates[sortedUpdates.length - 1]; // Fallback to last update

        if (creationUpdate && resolutionUpdate) {
            const creationTime = new Date(creationUpdate.timestamp).getTime();
            const resolutionTime = new Date(resolutionUpdate.timestamp).getTime();
            acc.push(resolutionTime - creationTime);
        }
        return acc;
    }, [] as number[]);

    let avgResolutionTime = "N/A";
    if (resolutionTimes.length > 0) {
        const avgMillis = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
        avgResolutionTime = formatDistanceStrict(new Date(0), new Date(avgMillis), { locale: pt });
    }
    
    // --- General KPIs ---
    const activeReports = data.filter(p => p.status !== 'collected' && p.status !== 'available').length;

    return {
        newReportsCount: newReports.length,
        avgResolutionTime,
        resolutionRate: resolutionRate.toFixed(0),
        activeReports,
    }
}

function DashboardPage() {
  const { allData } = usePoints();
  const router = useRouter();

  const kpis = React.useMemo(() => getKPIs(allData), [allData]);
  
  const intelligentAlerts = React.useMemo(() => getIntelligentAlerts(allData), [allData]);

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
            <IntelligentSummary allData={allData} />
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
                        <CardTitle className="text-3xl">{kpis.avgResolutionTime}</CardTitle>
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
                    <IntelligentAlerts alerts={intelligentAlerts} onViewOnMap={handleViewOnMap} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Visão Geral dos Reportes</CardTitle>
                            <CardDescription>
                            Número total por categoria.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-2">
                            <ChartContainer config={chartConfig} className="h-[230px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid horizontal={false} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        className="text-xs"
                                        width={80}
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

export default withAuth(DashboardPage, ['Agente Municipal', 'Administrador']);
