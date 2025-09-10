

"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Lightbulb, LightbulbOff, Zap, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterestMarker, getPinStyle } from "@/components/map-component";
import { PointOfInterest, statusLabelMap } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

function AssetDetails({ asset, incidents, onClose }: { asset: PointOfInterest, incidents: PointOfInterest[], onClose: () => void }) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{asset.title}</CardTitle>
                        <CardDescription>ID: {asset.id}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>X</Button>
                </div>
            </CardHeader>
            <CardContent className="text-sm">
                <p><span className="font-semibold">Tipo:</span> {asset.type === 'lighting_pole' ? 'Poste de Iluminação' : 'Posto de Transformação'}</p>
                <p><span className="font-semibold">Estado:</span> {asset.status ? statusLabelMap[asset.status] : 'N/A'}</p>
                {asset.lampType && <p><span className="font-semibold">Tipo de Lâmpada:</span> {asset.lampType}</p>}
                {asset.poleHeight && <p><span className="font-semibold">Altura:</span> {asset.poleHeight}m</p>}
                {asset.customData?.capacity && <p><span className="font-semibold">Capacidade:</span> {asset.customData.capacity} kVA</p>}
                
                <h4 className="font-semibold mt-4 mb-2 pt-4 border-t">Histórico de Reparos</h4>
                {incidents.length > 0 ? (
                    <div className="space-y-2">
                        {incidents.map(inc => (
                             <div key={inc.id} className="p-2 border rounded-md bg-muted/50">
                                <p className="font-medium text-xs">{inc.description}</p>
                                <p className="text-xs text-muted-foreground">Reportado há {formatDistanceToNow(new Date(inc.lastReported!), { locale: pt })}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">Nenhum histórico de reparos para este ativo.</p>
                )}
            </CardContent>
        </Card>
    )
}

function PublicLightingPage() {
    const { allData, loading } = usePoints();
    const [selectedAsset, setSelectedAsset] = React.useState<PointOfInterest | null>(null);

    const lightingPoles = React.useMemo(() => {
        return allData.filter(p => p.type === 'lighting_pole');
    }, [allData]);

    const pts = React.useMemo(() => {
        return allData.filter(p => p.type === 'pt');
    }, [allData]);
    
    const repairReports = React.useMemo(() => {
        return allData.filter(p => p.type === 'incident' && p.title === 'Iluminação pública com defeito');
    }, [allData]);

    const stats = React.useMemo(() => {
        const working = lightingPoles.filter(p => p.status === 'funcional').length;
        const faulty = lightingPoles.length - working;
        return {
            totalPoles: lightingPoles.length,
            workingPoles: working,
            faultyPoles: faulty,
            totalPTs: pts.length,
        }
    }, [lightingPoles, pts]);
    
    const recentFaults = React.useMemo(() => {
        return repairReports
            .sort((a, b) => new Date(b.lastReported!).getTime() - new Date(a.lastReported!).getTime())
            .slice(0, 5);
    }, [repairReports]);

    const relatedIncidents = React.useMemo(() => {
        if (!selectedAsset) return [];
        // A simple distance-based association for demonstration
        return repairReports.filter(report => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(selectedAsset.position),
                new google.maps.LatLng(report.position)
            );
            return distance < 100; // Associate reports within 100 meters
        });
    }, [selectedAsset, repairReports]);


    if (loading) {
        return <div>A carregar dados de iluminação...</div>;
    }

    const assetsToDisplay = [...lightingPoles, ...pts];

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['geometry']}>
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
                                    <p className="text-xs text-green-700 dark:text-green-400 flex items-center justify-center gap-1"><CheckCircle className="h-3 w-3"/> Funcionais</p>
                                </div>
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                    <p className="text-2xl font-bold text-red-600">{stats.faultyPoles}</p>
                                    <p className="text-xs text-red-700 dark:text-red-400 flex items-center justify-center gap-1"><LightbulbOff className="h-3 w-3"/> Avariados</p>
                                </div>
                            </CardContent>
                        </Card>

                        {selectedAsset ? (
                           <AssetDetails asset={selectedAsset} incidents={relatedIncidents} onClose={() => setSelectedAsset(null)} />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/> Reportes de Avaria Recentes</CardTitle>
                                    <CardDescription>Últimas 5 avarias reportadas por cidadãos.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {recentFaults.length > 0 ? recentFaults.map(report => (
                                        <div key={report.id} className="p-2 rounded-md border text-sm">
                                            <p className="truncate font-medium">{report.description}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(report.lastReported!).toLocaleString('pt-PT')}</p>
                                        </div>
                                    )) : <p className="text-sm text-center text-muted-foreground py-4">Nenhum reporte recente.</p>}
                                </CardContent>
                            </Card>
                        )}
                        
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
                                        onClick={() => setSelectedAsset(point)}
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
