
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { useUsers } from "@/services/user-service";
import { useFuelEntries } from "@/services/fuel-service";
import { usePoints } from "@/hooks/use-points";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowLeft, DollarSign, Fuel, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function CostAnalysisPage() {
    const { fuelEntries, loading: loadingFuel } = useFuelEntries();
    const { allData: allPoints, loading: loadingPoints } = usePoints();
    const { users, loading: loadingUsers } = useUsers();

    const costData = React.useMemo(() => {
        const fuelCosts = fuelEntries.map(e => ({ ...e, type: 'Combustível', partsCost: 0, laborCost: 0, cost: e.cost }));
        const maintenanceCosts = allPoints
            .filter(p => p.type === 'incident' && p.maintenanceId && p.status === 'collected')
            .map(p => ({
                id: p.id,
                date: p.lastReported,
                cost: (p.partsCost || 0) + (p.laborCost || 0),
                partsCost: p.partsCost || 0,
                laborCost: p.laborCost || 0,
                type: 'Manutenção',
                description: p.title,
                vehiclePlate: users.find(u => u.uid === p.authorId)?.vehicle?.plate || 'N/A',
            }));

        const allCosts = [...fuelCosts, ...maintenanceCosts].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
        
        const totalFuelCost = fuelCosts.reduce((acc, curr) => acc + curr.cost, 0);
        const totalPartsCost = maintenanceCosts.reduce((acc, curr) => acc + curr.partsCost, 0);
        const totalLaborCost = maintenanceCosts.reduce((acc, curr) => acc + curr.laborCost, 0);
        const totalMaintenanceCost = totalPartsCost + totalLaborCost;
        const totalCost = totalFuelCost + totalMaintenanceCost;

        const costByUser = users.filter(u => u.vehicle).map(user => {
            const userFuel = fuelEntries.filter(f => f.vehicleId === user.uid).reduce((sum, f) => sum + f.cost, 0);
            const userParts = allPoints.filter(p => p.authorId === user.uid && p.maintenanceId && p.partsCost).reduce((sum, p) => sum + p.partsCost!, 0);
            const userLabor = allPoints.filter(p => p.authorId === user.uid && p.maintenanceId && p.laborCost).reduce((sum, p) => sum + p.laborCost!, 0);
            return {
                name: user.displayName,
                Combustível: userFuel,
                Peças: userParts,
                'Mão de Obra': userLabor,
                Total: userFuel + userParts + userLabor,
            }
        }).filter(u => u.Total > 0).sort((a,b) => b.Total - a.Total);


        return { allCosts, totalFuelCost, totalMaintenanceCost, totalPartsCost, totalLaborCost, totalCost, costByUser };

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
                    Análise de Custos Operacionais
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6">
                 <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Custo Total</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader>
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
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Custo Médio / Veículo</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">AOA {(costData.totalCost / (costData.costByUser.length || 1)).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div></CardContent>
                        </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-5">
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Distribuição de Custos por Veículo</CardTitle>
                            <CardDescription>Comparativo dos custos totais por cada veículo da frota.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={costData.costByUser} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                    <XAxis type="number" tickFormatter={(value) => `AOA ${Number(value).toLocaleString()}`} />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }}/>
                                    <RechartsTooltip formatter={(value: number) => `AOA ${value.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`} />
                                    <Legend />
                                    <Bar dataKey="Combustível" stackId="a" fill="hsl(var(--chart-1))" />
                                    <Bar dataKey="Peças" stackId="a" fill="hsl(var(--chart-2))" />
                                    <Bar dataKey="Mão de Obra" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Últimos Custos Registados</CardTitle>
                            <CardDescription>Histórico de todos os custos lançados no sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Veículo</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className="text-right">Custo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {costData.allCosts.slice(0, 15).map((entry, index) => (
                                        <TableRow key={`${entry.id}-${index}`}>
                                            <TableCell className="font-medium">{entry.vehiclePlate}</TableCell>
                                            <TableCell>
                                                <Badge variant={entry.type === 'Combustível' ? 'secondary' : 'destructive'}>{entry.type}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">AOA {entry.cost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default withAuth(CostAnalysisPage, ['Agente Municipal', 'Administrador']);
