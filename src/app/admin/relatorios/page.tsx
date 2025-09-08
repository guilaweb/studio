
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { useUsers } from "@/services/user-service";
import { useFuelEntries } from "@/services/fuel-service";
import { usePoints } from "@/hooks/use-points";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/admin/relatorios/columns";
import { ReportsDataTable } from "@/components/admin/relatorios/data-table";

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

function FinancialReportsPage() {
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
                vehicleId: p.maintenanceId!.split('-')[0], // Extract vehicleId from maintenanceId
                vehiclePlate: p.title.split(' - ')[1] || 'N/A', // Extract plate from title
                driverName: users.find(u => u.uid === p.maintenanceId?.split('-')[0])?.displayName || 'N/A',
                type: 'Manutenção',
                description: p.title.split(' - ')[0],
                cost: (p.partsCost || 0) + (p.laborCost || 0),
                partsCost: p.partsCost || 0,
                laborCost: p.laborCost || 0,
            }));

        return [...fuelCosts, ...maintenanceCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                    Relatórios Financeiros da Frota
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Todos os Lançamentos de Custos</CardTitle>
                        <CardDescription>
                            Filtre e exporte todos os custos de combustível e manutenção registados no sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReportsDataTable columns={columns} data={costData} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(FinancialReportsPage, ['Agente Municipal', 'Administrador']);
