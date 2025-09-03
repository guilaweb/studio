
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { Logo } from "@/components/icons";
import { GenericPolygonsRenderer } from "@/components/generic-polygons-renderer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMapsLibrary } from "@vis.gl/react-google-maps";


export default function CroquiDocumentPage() {
    const params = useParams();
    const router = useRouter();
    const croquiId = params.id as string;
    const { allData, loading } = usePoints();
    const [croqui, setCroqui] = React.useState<PointOfInterest | null>(null);
    const geometry = useMapsLibrary('geometry');

    React.useEffect(() => {
        if (allData.length > 0) {
            const found = allData.find(p => p.id === croquiId && p.type === 'croqui');
            setCroqui(found || null);
        }
    }, [allData, croquiId]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">A carregar croqui...</div>;
    }

    if (!croqui) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Croqui não encontrado</CardTitle>
                        <CardDescription>O link que utilizou pode estar incorreto ou o croqui pode ter sido removido.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/')}>Voltar à Página Inicial</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    let calculatedArea = croqui.area;
    let calculatedPerimeter = 0;
    if (geometry && croqui.polygon && croqui.polygon.length > 2) {
        if (!calculatedArea) {
            calculatedArea = geometry.spherical.computeArea(croqui.polygon);
        }
        calculatedPerimeter = geometry.spherical.computeLength(croqui.polygon);
    }
    
    // Placeholder for UTM-like coordinates
    const simulateUTM = (lat: number, lng: number) => {
        return {
            este: 250000 + (lng * 1000),
            norte: 8320000 + (lat * 1000),
        }
    }
    
    const mapContainerClass = "w-full h-[45vh] border rounded-md overflow-hidden print:h-[25vh] print:break-inside-avoid";

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex flex-col bg-background text-foreground print:p-0 p-8 max-w-4xl mx-auto">
                <header className="flex flex-col items-center mb-6 print:mb-4">
                    <Logo className="h-10 w-10 text-primary" />
                    <h1 className="text-2xl font-bold mt-2">Croqui de Localização</h1>
                    <p className="text-muted-foreground">Mapa de Localização e Delimitação de Lote</p>
                </header>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={mapContainerClass}>
                         <Map
                            mapId={`croqui-doc-sat-${croqui.id}`}
                            defaultCenter={croqui.position}
                            defaultZoom={17}
                            gestureHandling="greedy"
                            mapTypeId={'satellite'}
                        >
                            {croqui.polygon && <GenericPolygonsRenderer plots={[croqui]} selectedPlotId={null} onPlotClick={() => {}} />}
                            <AdvancedMarker position={croqui.position} title={croqui.title}>
                                <Pin background={'hsl(var(--primary))'} borderColor={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary-foreground))'} />
                            </AdvancedMarker>
                        </Map>
                    </div>
                     <div className={mapContainerClass}>
                         <Map
                            mapId={`croqui-doc-map-${croqui.id}`}
                            defaultCenter={croqui.position}
                            defaultZoom={17}
                            gestureHandling="greedy"
                            mapTypeId={'roadmap'}
                        >
                            {croqui.polygon && <GenericPolygonsRenderer plots={[croqui]} selectedPlotId={null} onPlotClick={() => {}} />}
                            <AdvancedMarker position={croqui.position} title={croqui.title}>
                                <Pin background={'hsl(var(--primary))'} borderColor={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary-foreground))'} />
                            </AdvancedMarker>
                        </Map>
                    </div>
                </div>
                
                 <div className="print:break-inside-avoid">
                    <h2 className="text-lg font-semibold mb-2">Tabela de Coordenadas (Datum WGS84)</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">VERT.</TableHead>
                                <TableHead>COORDENADA ESTE (m)</TableHead>
                                <TableHead>COORDENADA NORTE (m)</TableHead>
                                <TableHead>LATITUDE</TableHead>
                                <TableHead>LONGITUDE</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {croqui.polygon?.map((point, index) => {
                                const utm = simulateUTM(point.lat, point.lng);
                                return (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{utm.este.toFixed(2)}</TableCell>
                                    <TableCell>{utm.norte.toFixed(2)}</TableCell>
                                    <TableCell>{point.lat.toFixed(6)}</TableCell>
                                    <TableCell>{point.lng.toFixed(6)}</TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>

                <footer className="mt-8 pt-4 border-t flex justify-between items-end print:break-inside-avoid">
                    <div className="text-xs space-y-1">
                        <p><strong>REQUERENTE:</strong> {croqui.customData?.requesterName || 'N/A'}</p>
                        <p><strong>Província:</strong> {croqui.customData?.province || 'N/A'}</p>
                        <p><strong>Município:</strong> {croqui.customData?.municipality || 'N/A'}</p>
                        {calculatedArea && <p><strong>Área:</strong> {calculatedArea.toFixed(2)} m²</p>}
                        {calculatedPerimeter > 0 && <p><strong>Perímetro:</strong> {calculatedPerimeter.toFixed(2)} m</p>}
                        <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-PT')}</p>
                    </div>
                    <div className="text-xs text-right space-y-2">
                         <div className="flex items-center justify-end gap-2 font-semibold">
                            <Logo className="h-5 w-5"/> MUNITU
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold">Escala (Aprox.): 1:1000</p>
                            <div className="flex items-center justify-end">
                                <div className="border-y border-l border-black h-3 w-4"></div>
                                <div className="border-y border-black h-3 w-4 bg-black"></div>
                                <div className="border-y border-black h-3 w-4"></div>
                                <div className="border-y border-r border-black h-3 w-4 bg-black"></div>
                            </div>
                            <div className="flex justify-between text-[8px] font-mono px-0.5">
                               <span>0</span><span>25</span><span>50m</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </APIProvider>
    );
}
