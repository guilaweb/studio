
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { useUsers } from "@/services/user-service";
import { useFuelEntries } from "@/services/fuel-service";
import { usePoints } from "@/hooks/use-points";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, Scatter, ScatterChart } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, Fuel, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface CostItem {
    id: string;
    date: string;
    vehicleId: string;
    vehiclePlate: string;
    driverName: string;
    type: 'Combustível' | 'Manutenção';
    description: string;
    cost: number;
    partsCost?: number;
    laborCost?: number;
}


function CostAnalysisPage() {
    const { fuelEntries, loading: loadingFuel } = useFuelEntries();
    const { allData: allPoints, loading: loadingPoints } = usePoints();
    const { users, loading: loadingUsers } = useUsers();

    const costData = React.useMemo(() => {
        const fuelCosts: CostItem[] = fuelEntries.map(e => ({
            id: e.id!,
            date: e.date,
            vehicleId: e.vehicleId,
            vehiclePlate: e.vehiclePlate,
            driverName: e.driverName,
            type: 'Combustível',
            description: `${e.liters.toFixed(2)} L @ AOA ${(e.cost / e.liters).toFixed(2)}/L`,
            cost: e.cost,
            partsCost: 0,
            laborCost: 0,
        }));

        const maintenanceCosts: CostItem[] = allPoints
            .filter(p => p.type === 'incident' && p.maintenanceId && p.status === 'collected')
            .map(p => ({
                id: p.id,
                date: p.lastReported!,
                vehicleId: p.maintenanceId!.split('-')[0],
                vehiclePlate: users.find(u => u.uid === p.maintenanceId?.split('-')[0])?.vehicle?.plate || 'N/A',
                driverName: users.find(u => u.uid === p.maintenanceId?.split('-')[0])?.displayName || 'N/A',
                type: 'Manutenção',
                description: p.title.split(' - ')[0],
                cost: (p.partsCost || 0) + (p.laborCost || 0),
                partsCost: p.partsCost || 0,
                laborCost: p.laborCost || 0,
            }));

        const allCosts = [...fuelCosts, ...maintenanceCosts].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
        
        const totalFuelCost = fuelCosts.reduce((acc, curr) => acc + curr.cost, 0);
        const totalPartsCost = maintenanceCosts.reduce((acc, curr) => acc + curr.partsCost!, 0);
        const totalLaborCost = maintenanceCosts.reduce((acc, curr) => acc + curr.laborCost!, 0);
        const totalMaintenanceCost = totalPartsCost + totalLaborCost;
        const totalCost = totalFuelCost + totalMaintenanceCost;

        const fleetPerformance = users.filter(u => u.vehicle && u.role === 'Agente Municipal').map(user => {
            const userFuelEntries = fuelEntries.filter(f => f.vehicleId === user.uid).sort((a, b) => a.odometer - b.odometer);
            const userMaintenanceCosts = maintenanceCosts.filter(m => m.vehicleId === user.uid);
            
            let totalDistance = 0;
            if (userFuelEntries.length > 1) {
                totalDistance = userFuelEntries[userFuelEntries.length - 1].odometer - userFuelEntries[0].odometer;
            }
            const totalLiters = userFuelEntries.reduce((sum, f) => sum + f.liters, 0);
            const fuelCost = userFuelEntries.reduce((sum, f) => sum + f.cost, 0);
            const maintenanceCost = userMaintenanceCosts.reduce((sum, m) => sum + m.cost, 0);
            const vehicleTotalCost = fuelCost + maintenanceCost;
            
            return {
                driverName: user.displayName,
                vehiclePlate: user.vehicle?.plate,
                totalDistance: totalDistance,
                totalCost: vehicleTotalCost,
                costPerKm: totalDistance > 0 ? vehicleTotalCost / totalDistance : 0,
                avgConsumption: totalDistance > 0 && totalLiters > 0 ? (totalLiters / totalDistance) * 100 : 0, // L/100km
                performanceScore: user.stats?.performanceScore || 0,
                // for bar chart
                Combustível: fuelCost,
                'Peças': userMaintenanceCosts.reduce((s, m) => s + m.partsCost!, 0),
                'Mão de Obra': userMaintenanceCosts.reduce((s, m) => s + m.laborCost!, 0),
            }
        }).filter(d => d.totalDistance > 0);


        return { allCosts, totalFuelCost, totalMaintenanceCost, totalCost, fleetPerformance, totalPartsCost, totalLaborCost };

    }, [fuelEntries, allPoints, users]);
    
    if (loadingFuel || loadingPoints || loadingUsers) {
        return <div className="flex h-screen w-full items-center justify-center">A carregar dados de custos...</div>;
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
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Performance Financeira da Frota
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6">
                 <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Custo Total da Frota</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">AOA {costData.totalCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Custo Combustível</CardTitle><Fuel className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">AOA {costData.totalFuelCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Custo Manutenção</CardTitle><Wrench className="h-4 w-4 text-muted-foreground"/></CardHeader>
                             <CardContent><div className="text-2xl font-bold">AOA {costData.totalMaintenanceCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Custo Peças</CardTitle><Wrench className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">AOA {costData.totalPartsCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Custo Mão de Obra</CardTitle><Wrench className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">AOA {costData.totalLaborCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div></CardContent>
                        </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-5">
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Análise de Performance vs. Custo</CardTitle>
                            <CardDescription>Correlação entre a pontuação do motorista e o seu custo por quilómetro.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={350}>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid />
                                    <XAxis type="number" dataKey="performanceScore" name="Pontuação" unit="" domain={[60, 100]} label={{ value: 'Pontuação de Desempenho', position: 'insideBottom', offset: -15 }} />
                                    <YAxis type="number" dataKey="costPerKm" name="Custo/Km" unit=" AOA" label={{ value: 'Custo / Km (AOA)', angle: -90, position: 'insideLeft' }} tickFormatter={(value) => Number(value).toFixed(2)}/>
                                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => {
                                        if(name === 'Custo/Km') return `${Number(value).toFixed(2)} AOA`;
                                        return value;
                                    }}/>
                                    <Legend />
                                    <Scatter name="Veículos da Frota" data={costData.fleetPerformance} fill="hsl(var(--chart-1))" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Distribuição de Custos por Veículo</CardTitle>
                            <CardDescription>Comparativo dos custos por cada veículo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={costData.fleetPerformance} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                    <XAxis type="number" tickFormatter={(value) => `AOA ${Number(value).toLocaleString()}`} />
                                    <YAxis dataKey="vehiclePlate" type="category" width={80} tick={{ fontSize: 12 }}/>
                                    <RechartsTooltip formatter={(value: number) => `AOA ${value.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`} />
                                    <Legend />
                                    <Bar dataKey="Combustível" stackId="a" fill="hsl(var(--chart-1))" />
                                    <Bar dataKey="Peças" stackId="a" fill="hsl(var(--chart-2))" />
                                    <Bar dataKey="Mão de Obra" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Tabela de Performance da Frota</CardTitle>
                        <CardDescription>Análise detalhada do custo e consumo por cada veículo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Veículo</TableHead>
                                    <TableHead className="text-right">Distância Total (km)</TableHead>
                                    <TableHead className="text-right">Custo Total (AOA)</TableHead>
                                    <TableHead className="text-right">Custo / Km (AOA)</TableHead>
                                    <TableHead className="text-right">Consumo (L/100km)</TableHead>
                                    <TableHead className="text-right">Pontuação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {costData.fleetPerformance.sort((a,b) => b.costPerKm - a.costPerKm).map((v) => (
                                    <TableRow key={v.vehiclePlate}>
                                        <TableCell className="font-medium">{v.vehiclePlate} <span className="text-xs text-muted-foreground">({v.driverName})</span></TableCell>
                                        <TableCell className="text-right font-mono">{v.totalDistance.toLocaleString('pt-PT')}</TableCell>
                                        <TableCell className="text-right font-mono">{v.totalCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-primary">{v.costPerKm.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-mono">{v.avgConsumption.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-mono">{v.performanceScore}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(CostAnalysisPage, ['Agente Municipal', 'Administrador', 'Super Administrador']);
