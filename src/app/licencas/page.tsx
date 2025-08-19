
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { statusLabelMap } from "@/lib/data";

const LicenseRequestCard = ({ project }: { project: PointOfInterest }) => {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Submetido em: {new Date(project.lastReported!).toLocaleDateString('pt-PT')}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge variant={project.status === 'approved' ? 'default' : (project.status === 'rejected' ? 'destructive' : 'secondary')} className={project.status === 'approved' ? 'bg-green-600' : ''}>
                        {project.status ? statusLabelMap[project.status] : "N/A"}
                    </Badge>
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/projetos/${project.id}`}>Ver Processo</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}


function LicencasPage() {
    const { allData, loading } = usePoints();
    const { user } = useAuth();

    const userProjects = React.useMemo(() => {
        if (!user) return [];
        return allData.filter(p => p.type === 'construction' && p.authorId === user.uid);
    }, [allData, user]);

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
                    Licenciamento de Obras
                </h1>
                 <div className="ml-auto">
                     <Button asChild>
                        <Link href="/licencas/novo">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Pedido de Licença
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                {loading ? (
                    <p>A carregar os seus pedidos...</p>
                ) : userProjects.length > 0 ? (
                     <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Os Meus Pedidos de Licença</CardTitle>
                                <CardDescription>Acompanhe o estado de todos os seus processos de licenciamento.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {userProjects.map(p => <LicenseRequestCard key={p.id} project={p} />)}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-2xl font-bold tracking-tight">Ainda não solicitou nenhuma licença</h3>
                            <p className="text-muted-foreground">Inicie um novo processo para licenciar a sua obra ou projeto.</p>
                            <Button className="mt-4" asChild>
                                <Link href="/licencas/novo">
                                     <Plus className="mr-2 h-4 w-4" />
                                     Iniciar Novo Pedido
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(LicencasPage);
