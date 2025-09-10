

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, statusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
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

    const landPlot = React.useMemo(() => {
        if (!croqui || !croqui.landPlotId) return null;
        return allData.find(p => p.id === croqui.landPlotId);
    }, [croqui, allData]);


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
            este: 250000 + (lng * 10000),
            norte: 8320000 + (lat * 10000),
        }
    }
    
    const mapContainerClass = "w-full h-[45vh] border rounded-md overflow-hidden print:h-[25vh] print:break-inside-avoid";
    const usageTypeMap: Record<string, string> = {
        residential: "Residencial",
        commercial: "Comercial",
        industrial: "Industrial",
        mixed: "Misto",
        other: "Outro",
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex flex-col bg-background text-foreground print:p-0 p-8 max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-6 print:mb-4 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Logo className="h-10 w-10 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold">Croqui de Localização</h1>
                            <p className="text-muted-foreground text-sm">Mapa de Localização e Delimitação de Lote</p>
                        </div>
                    </div>
                     <div className="text-right">
                        <p className="font-semibold">{croqui.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {croqui.id}</p>
                    </div>
                </header>
                
                <div className="grid grid-cols-2 gap-4 mb-6 print:gap-2">
                    <div className={mapContainerClass}>
                         <Map
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
                                <TableHead className="w-[80px]">Estaca</TableHead>
                                <TableHead>Coordenada Norte (m)</TableHead>
                                <TableHead>Coordenada Este (m)</TableHead>
                                <TableHead>Latitude</TableHead>
                                <TableHead>Longitude</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {croqui.polygon?.map((point, index) => {
                                const utm = simulateUTM(point.lat, point.lng);
                                return (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">V{index + 1}</TableCell>
                                    <TableCell>{utm.norte.toFixed(3)}</TableCell>
                                    <TableCell>{utm.este.toFixed(3)}</TableCell>
                                    <TableCell>{point.lat.toFixed(6)}</TableCell>
                                    <TableCell>{point.lng.toFixed(6)}</TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
                
                 {landPlot && (
                    <div className="print:break-inside-avoid mt-6">
                        <h2 className="text-lg font-semibold mb-2">Informação do Lote de Terreno Associado</h2>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs border p-4 rounded-md">
                             <div><strong className="text-muted-foreground">Estado:</strong> {landPlot.status ? statusLabelMap[landPlot.status] : "N/A"}</div>
                             <div><strong className="text-muted-foreground">Uso Permitido:</strong> {landPlot.usageType ? usageTypeMap[landPlot.usageType] : 'N/A'}</div>
                             <div><strong className="text-muted-foreground">Nº Lote:</strong> {landPlot.plotNumber || 'N/A'}</div>
                             <div><strong className="text-muted-foreground">Registo Predial:</strong> {landPlot.registrationCode || 'N/A'}</div>
                             <div><strong className="text-muted-foreground">Altura Máx.:</strong> {landPlot.maxHeight ? `${landPlot.maxHeight} pisos` : 'N/A'}</div>
                             <div><strong className="text-muted-foreground">Índice Construção:</strong> {landPlot.buildingRatio ? `${landPlot.buildingRatio}%` : 'N/A'}</div>
                        </div>
                    </div>
                )}


                <footer className="mt-8 pt-4 border-t grid grid-cols-3 gap-4 text-xs print:break-inside-avoid">
                    <div className="space-y-1">
                        <h4 className="font-semibold mb-1">Informações do Requerente</h4>
                        <p><strong>Nome:</strong> {croqui.customData?.requesterName || 'N/A'}</p>
                        <p><strong>Província:</strong> {croqui.customData?.province || 'N/A'}</p>
                        <p><strong>Município:</strong> {croqui.customData?.municipality || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-semibold mb-1">Detalhes do Croqui</h4>
                        {calculatedArea && <p><strong>Área:</strong> {calculatedArea.toFixed(2)} m²</p>}
                        {calculatedPerimeter > 0 && <p><strong>Perímetro:</strong> {calculatedPerimeter.toFixed(2)} m</p>}
                    </div>
                     <div className="space-y-1">
                        <h4 className="font-semibold mb-1">Detalhes Técnicos</h4>
                        <p><strong>Téc. Responsável:</strong> {croqui.customData?.technicianName || 'N/A'}</p>
                        <p><strong>Nº Ordem:</strong> {croqui.customData?.technicianId || 'N/A'}</p>
                        <p><strong>Data Levantamento:</strong> {croqui.customData?.surveyDate ? new Date(croqui.customData.surveyDate).toLocaleDateString('pt-PT') : 'N/A'}</p>
                        <p><strong>Base Cartográfica:</strong> Imagem de Satélite Google</p>
                    </div>
                </footer>
                 <footer className="mt-6 pt-4 border-t flex justify-between items-end print:break-inside-avoid">
                    <div className="text-xs space-y-1">
                        <div className="flex items-center justify-start gap-2 font-semibold">
                            <Logo className="h-5 w-5"/> MUNITU
                        </div>
                        <p>Documento gerado em {new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
                        <p className="text-muted-foreground">Este documento é um croqui de localização e não substitui uma certidão predial.</p>
                    </div>
                    <div className="text-xs text-right space-y-2">
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
