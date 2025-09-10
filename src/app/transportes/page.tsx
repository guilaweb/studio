
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Bus, Eye } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PointOfInterest } from "@/lib/data";
import { useRouter } from "next/navigation";

const RouteCard = ({ route, onViewOnMap }: { route: PointOfInterest, onViewOnMap: (id: string) => void }) => {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Bus className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{route.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Operado por: {route.authorDisplayName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewOnMap(route.id)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver no Mapa
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

function PublicTransportPage() {
    const { allData, loading } = usePoints();
    const router = useRouter();

    const transportRoutes = React.useMemo(() => {
        // We will refine this later to have a specific type, for now, 'croqui' is the proxy
        return allData.filter(p => p.type === 'croqui' && p.collectionName?.toLowerCase().includes('transporte'));
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
                    Transportes Públicos
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Rotas Disponíveis</CardTitle>
                        <CardDescription>
                            Consulte as rotas e linhas de transporte público mapeadas na plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <p>A carregar rotas...</p>
                        ) : transportRoutes.length > 0 ? (
                            transportRoutes.map(route => (
                                <RouteCard key={route.id} route={route} onViewOnMap={handleViewOnMap} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Bus className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">Nenhuma rota de transporte</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Ainda não foram mapeadas rotas de transporte público.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(PublicTransportPage);
