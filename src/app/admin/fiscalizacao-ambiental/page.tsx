
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoints } from "@/hooks/use-points";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PointOfInterest } from "@/lib/data";
import { DataTable } from "@/components/dashboard/data-table"; 
import { columns } from "./columns";
import { useRouter } from "next/navigation";


function EnvironmentalInspectionPage() {
    const { allData, loading } = usePoints();
    const router = useRouter();

    const pollutionReports = React.useMemo(() => {
        return allData.filter(p => p.title === 'Reporte de Poluição');
    }, [allData]);

    const handleViewOnMap = (poiId: string) => {
        router.push(`/?poi=${poiId}`);
    };

    if (loading) {
        return <div>A carregar ocorrências...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Fiscalização Ambiental
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ocorrências de Poluição</CardTitle>
                        <CardDescription>
                            Gira e analise todos os reportes de poluição submetidos pelos cidadãos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns} 
                            data={pollutionReports} 
                            onViewOnMap={handleViewOnMap}
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(EnvironmentalInspectionPage, ['Agente Municipal', 'Administrador', 'Super Administrador']);
