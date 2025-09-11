
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoints } from "@/hooks/use-points";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/admin/projetos/data-table";
import { columns } from "@/components/admin/projetos/columns";
import { PointOfInterest } from "@/lib/data";

function AdminProjectsPage() {
    const { allData, loading, updatePointStatus } = usePoints();

    const projects = React.useMemo(() => {
        return allData.filter(p => p.type === 'construction');
    }, [allData]);

    const handleUpdateProjectStatus = async (projectId: string, status: PointOfInterest['status']) => {
        await updatePointStatus(projectId, status);
    };

    if (loading) {
        return <div>A carregar projetos...</div>;
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
                    Gestão de Projetos de Construção
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Todos os Projetos</CardTitle>
                        <CardDescription>
                            Reveja, gira e defina o estado de todos os pedidos de licenciamento submetidos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns} 
                            data={projects} 
                            onUpdateProjectStatus={handleUpdateProjectStatus}
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(AdminProjectsPage, ['Agente Municipal', 'Administrador', 'Super Administrador']);
