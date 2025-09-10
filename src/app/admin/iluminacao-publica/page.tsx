
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Lightbulb, LightbulbOff, Zap, AlertTriangle } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterestMarker } from "@/components/map-component";
import { PointOfInterest } from "@/lib/data";

function PublicLightingPage() {
    const { allData, loading } = usePoints();
    const [stats, setStats] = React.useState({ totalPoles: 0, workingPoles: 0, faultyPoles: 0, totalPTs: 0 });
    const [recentReports, setRecentReports] = React.useState<PointOfInterest[]>([]);

    const lightingPoles = React.useMemo(() => {
        return allData.filter(p => p.type === 'lighting_pole');
    }, [allData]);

    const pts = React.useMemo(() => {
        return allData.filter(p => p.type === 'pt');
    }, [allData]);

    React.useEffect(() => {
        const working = lightingPoles.filter(p => p.status === 'funcional').length;
        const faulty = lightingPoles.length - working;
        setStats({
            totalPoles: lightingPoles.length,
            workingPoles: working,
            faultyPoles: faulty,
            totalPTs: pts.length,
        });

        const recent = allData
            .filter(p => p.type === 'incident' && p.title === 'Iluminação pública com defeito')
            .sort((a, b) => new Date(b.lastReported!).getTime() - new Date(a.lastReported!).getTime())
            .slice(0, 5);
        setRecentReports(recent);

    }, [allData, lightingPoles, pts]);

    if (loading) {
        return <div>A carregar dados de iluminação...</div>;
    }

    const assetsToDisplay = [...lightingPoles, ...pts];

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Gestão de Iluminação Pública
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="md:col-span-1 lg:col-span-1 space-y-4">
                         <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Estatísticas da Rede</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-center">
                                 <div className="p-2 rounded-lg bg-muted">
                                    <p className="text-2xl font-bold">{stats.totalPoles}</p>
                                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Lightbulb className="h-3 w-3"/> Postes Totais</p>
                                </div>
                                <div className="p-2 rounded-lg bg-muted">
                                    <p className="text-2xl font-bold">{stats.totalPTs}</p>
                                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Zap className="h-3 w-3"/> PTs Totais</p>
                                </div>
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <p className="text-2xl font-bold text-green-600">{stats.workingPoles}</p>
                                    <p className="text-xs text-green-700 dark:text-green-400 flex items-center justify-center gap-1"><Lightbulb className="h-3 w-3"/> Funcionais</p>
                                </div>
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                    <p className="text-2xl font-bold text-red-600">{stats.faultyPoles}</p>
                                    <p className="text-xs text-red-700 dark:text-red-400 flex items-center justify-center gap-1"><LightbulbOff className="h-3 w-3"/> Avariados</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/> Reportes Recentes</CardTitle>
                                <CardDescription>Últimas 5 avarias reportadas por cidadãos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recentReports.length > 0 ? recentReports.map(report => (
                                     <div key={report.id} className="p-2 rounded-md border text-sm">
                                        <p className="truncate font-medium">{report.description}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(report.lastReported!).toLocaleString('pt-PT')}</p>
                                     </div>
                                )) : <p className="text-sm text-center text-muted-foreground py-4">Nenhum reporte recente.</p>}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card className="h-[calc(100vh-10rem)]">
                             <Map
                                mapId="lighting-management-map"
                                defaultCenter={{ lat: -8.83, lng: 13.23 }}
                                defaultZoom={13}
                                gestureHandling={'greedy'}
                                disableDefaultUI={false}
                            >
                                {assetsToDisplay.map(point => (
                                    <PointOfInterestMarker
                                        key={point.id}
                                        point={point}
                                        onClick={() => {}}
                                        onMouseOut={() => {}}
                                        onMouseOver={() => {}}
                                    />
                                ))}
                            </Map>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(PublicLightingPage, ['Agente Municipal', 'Administrador']);
