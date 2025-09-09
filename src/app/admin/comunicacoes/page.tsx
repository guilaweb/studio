
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoints } from "@/hooks/use-points";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { PointOfInterest } from "@/lib/data";
import { columns } from "@/components/admin/comunicacoes/columns";
import { CommunicationsDataTable } from "@/components/admin/comunicacoes/data-table";

function AdminAnnouncementsPage() {
    const { allData, loading } = usePoints();
    
    const announcements = React.useMemo(() => {
        return allData.filter(p => p.type === 'announcement');
    }, [allData]);

    if (loading) {
        return <div>A carregar comunicados...</div>;
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
                    Gestão de Comunicações
                </h1>
                <div className="ml-auto">
                    <Button asChild>
                        <Link href="/?#report-announcement">
                           <Plus className="mr-2 h-4 w-4" /> Novo Anúncio
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Todos os Anúncios</CardTitle>
                        <CardDescription>
                            Gira, edite e arquive todos os comunicados oficiais da plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CommunicationsDataTable 
                            columns={columns} 
                            data={announcements} 
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(AdminAnnouncementsPage, ['Agente Municipal', 'Administrador']);
