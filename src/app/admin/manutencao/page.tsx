
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Wrench } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { columns } from "./columns";
import { MaintenanceDataTable } from "./data-table";
import MaintenanceOrderEditor from "@/components/admin/manutencao/maintenance-order-editor";

function FleetMaintenancePage() {
    const { allData, loading } = usePoints();
    const { profile } = useAuth();
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [selectedOrder, setSelectedOrder] = React.useState<PointOfInterest | null>(null);

    const maintenanceOrders = React.useMemo(() => {
        return allData.filter(p => p.maintenanceId);
    }, [allData]);

    const handleEditOrder = (order: PointOfInterest) => {
        setSelectedOrder(order);
        setSheetOpen(true);
    };
    
    const handleSheetClose = () => {
        setSheetOpen(false);
        setSelectedOrder(null);
    }

    if (loading) {
        return <div>A carregar ordens de manutenção...</div>;
    }

    return (
        <>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/admin/equipa">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Gestão de Manutenção da Frota
                    </h1>
                    <div className="ml-auto">
                        <Button onClick={() => handleEditOrder(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Nova Ordem de Serviço
                        </Button>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ordens de Serviço de Manutenção</CardTitle>
                            <CardDescription>
                                Gira todas as manutenções preventivas, preditivas e corretivas da sua frota.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MaintenanceDataTable
                                columns={columns}
                                data={maintenanceOrders}
                                meta={{ onEditOrder: handleEditOrder }}
                            />
                        </CardContent>
                    </Card>
                </main>
            </div>
            <MaintenanceOrderEditor 
                isOpen={sheetOpen}
                onOpenChange={handleSheetClose}
                order={selectedOrder}
            />
        </>
    );
}

export default withAuth(FleetMaintenancePage, ['Administrador', 'Super Administrador']);

