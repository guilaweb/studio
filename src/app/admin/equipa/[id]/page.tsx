
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { withAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/services/user-service";
import { useFuelEntries } from "@/services/fuel-service";
import { useMaintenancePlans } from "@/services/maintenance-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Car, Fuel, TrendingUp, AlertTriangle, User, Wrench } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { usePoints } from "@/hooks/use-points";
import PredictiveMaintenanceAnalysis from "@/components/team-management/predictive-maintenance-analysis";

const fuelConsumptionChartConfig = {
  consumption: { label: "Km/L", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const performanceScoreChartConfig = {
    score: { label: "Pontuação", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


function VehicleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const vehicleId = params.id as string;

    const { user, loading: loadingUser } = useUserProfile(vehicleId);
    const { fuelEntries, loading: loadingFuel } = useFuelEntries();
    const { allData: allPoints, loading: loadingPoints } = usePoints();

    const vehicleFuelEntries = React.useMemo(() => {
        return fuelEntries.filter(entry => entry.vehicleId === vehicleId);
    }, [fuelEntries, vehicleId]);

    const vehicleStats = React.useMemo(() => {
        if (vehicleFuelEntries.length < 2) {
            return { totalDistance: 0, avgConsumption: 0, consumptionData: [] };
        }
        let totalDistance = 0;
        const consumptions: { name: string, consumption: number }[] = [];

        const sortedEntries = [...vehicleFuelEntries].sort((a,b) => a.odometer - b.odometer);

        for(let i = 1; i < sortedEntries.length; i++) {
            const prev = sortedEntries[i-1];
            const current = sortedEntries[i];
            const distance = current.odometer - prev.odometer;
            totalDistance += distance;
            if (prev.liters > 0) {
                consumptions.push({ 
                    name: format(new Date(current.date), "dd/MM"),
                    consumption: parseFloat((distance / prev.liters).toFixed(2)) 
                });
            }
        }
        
        const avgConsumption = consumptions.length > 0 ? consumptions.reduce((acc, c) => acc + c, 0) / consumptions.length : 0;
        
        return { totalDistance, avgConsumption, consumptionData: consumptions };

    }, [vehicleFuelEntries]);
    
    // Mock data for other charts
    const performanceData = [
        { month: "Jan", score: 82 }, { month: "Fev", score: 85 }, { month: "Mar", score: 88 },
        { month: "Abr", score: 86 }, { month: "Mai", score: 90 }, { month: "Jun", score: 92 },
    ];
    const telemetriaAlerts = [
      { date: "2024-07-29", time: "14:32", event: "Excesso de Velocidade", details: "115 km/h na EN-100 (Limite: 80 km/h)" },
      { date: "2024-07-28", time: "09:15", event: "Travagem Brusca", details: "Redução de 80 para 20 km/h em 2s" },
      { date: "2024-07-27", time: "11:05", event: "Aceleração Brusca", details: "Aumento de 0 para 50 km/h em 3s" },
      { date: "2024-07-27", time: "16:20", event: "Curva Perigosa", details: "Curva a 70 km/h na saída para o Zango" },
      { date: "2024-07-26", time: "13:00", event: "Tempo de Inatividade Excessivo", details: "Motor ligado por 25 min sem movimento" },
    ];

    const maintenanceHistory = React.useMemo(() => {
        return allPoints.filter(p => 
            p.maintenanceId?.startsWith(vehicleId) && 
            p.status === 'collected'
        );
    }, [allPoints, vehicleId]);


    if (loadingUser || loadingFuel || loadingPoints) {
        return <div className="flex h-screen w-full items-center justify-center">A carregar detalhes do veículo...</div>
    }

    if (!user) {
         return <div className="flex h-screen w-full items-center justify-center">Veículo não encontrado.</div>
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/admin/equipa">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                     <Avatar className="h-12 w-12 hidden sm:flex">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            {user.displayName}
                        </h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                           <Car className="h-4 w-4"/> {user.vehicle?.type} ({user.vehicle?.plate})
                        </p>
                    </div>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Distância (Últimos Abast.)</CardTitle><Car className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{vehicleStats.totalDistance.toLocaleString('pt-PT')} km</div></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Consumo Médio</CardTitle><Fuel className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{vehicleStats.avgConsumption.toFixed(2)} km/L</div></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Pontuação Desempenho</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{user.stats?.performanceScore || 'N/A'}</div></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Alertas (Últimos 30d)</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{telemetriaAlerts.length}</div></CardContent>
                        </Card>
                </div>
                 <div className="grid gap-6 md:grid-cols-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Evolução do Consumo de Combustível (Km/L)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={fuelConsumptionChartConfig} className="h-[250px] w-full">
                                <LineChart data={vehicleStats.consumptionData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide/>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                    <Line dataKey="consumption" type="monotone" stroke="var(--color-consumption)" strokeWidth={2} dot={true} />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Evolução da Pontuação de Desempenho</CardTitle>
                        </CardHeader>
                        <CardContent>
                              <ChartContainer config={performanceScoreChartConfig} className="h-[250px] w-full">
                                <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis domain={[70, 100]} hide/>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                    <Line dataKey="score" type="monotone" stroke="var(--color-score)" strokeWidth={2} dot={true} />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                         <CardHeader>
                            <CardTitle>Histórico de Abastecimentos</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Odómetro (km)</TableHead>
                                        <TableHead className="text-right">Litros</TableHead>
                                        <TableHead className="text-right">Custo Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicleFuelEntries.slice(0, 10).map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                                            <TableCell>{entry.odometer.toLocaleString('pt-PT')}</TableCell>
                                            <TableCell className="text-right">{entry.liters.toFixed(2)} L</TableCell>
                                            <TableCell className="text-right">AOA {entry.cost.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Eventos de Condução (Telemetria)</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader>
                                        <TableRow><TableHead>Data</TableHead><TableHead>Evento</TableHead><TableHead>Detalhes</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {telemetriaAlerts.map((alert, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{format(new Date(alert.date), "dd/MM/yy")}</TableCell>
                                            <TableCell>{alert.event}</TableCell>
                                            <TableCell className="text-xs">{alert.details}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico de Manutenções</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <Table>
                                    <TableHeader>
                                        <TableRow><TableHead>Data</TableHead><TableHead>Serviço</TableHead><TableHead className="text-right">Custo</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {maintenanceHistory.map((maint, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{format(new Date(maint.lastReported!), "dd/MM/yyyy")}</TableCell>
                                            <TableCell>{maint.title}</TableCell>
                                            <TableCell className="text-right">{maint.cost ? `AOA ${maint.cost.toFixed(2)}` : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                 {maintenanceHistory.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">Nenhuma manutenção concluída registada.</p>}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                {user && <PredictiveMaintenanceAnalysis user={user} />}
            </main>
        </div>
    );
}

export default withAuth(VehicleDetailPage, ['Agente Municipal', 'Administrador']);

    
