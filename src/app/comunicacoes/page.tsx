
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { announcementCategoryMap } from "@/lib/data";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useRouter } from "next/navigation";

function PublicCommunicationsPage() {
    const { allData, loading } = usePoints();
    const router = useRouter();

    const activeAnnouncements = React.useMemo(() => {
        const now = new Date();
        return allData.filter(p => 
            p.type === 'announcement' && 
            p.endDate && 
            new Date(p.endDate) > now
        ).sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime());
    }, [allData]);

    const handleViewOnMap = (poiId: string) => {
        router.push(`/?poi=${poiId}`);
    };

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
                    Portal de Comunicações
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Comunicados Oficiais Ativos</CardTitle>
                        <CardDescription>
                            Consulte aqui os últimos anúncios e avisos da administração municipal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <p>A carregar comunicados...</p>
                        ) : activeAnnouncements.length > 0 ? (
                            activeAnnouncements.map(ann => (
                                <Card key={ann.id}>
                                    <CardContent className="p-4 flex items-center justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs font-semibold text-primary">
                                                {ann.announcementCategory ? announcementCategoryMap[ann.announcementCategory] : 'Aviso'}
                                            </p>
                                            <p className="font-semibold">{ann.title}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{ann.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Válido de {format(new Date(ann.startDate!), "dd/MM/yyyy")} até {format(new Date(ann.endDate!), "dd/MM/yyyy")}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleViewOnMap(ann.id)}>
                                            Ver no Mapa
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">Sem comunicados ativos</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Não existem anúncios ou avisos ativos no momento.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(PublicCommunicationsPage, ['Cidadao', 'Agente Municipal', 'Administrador']);
