
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Layers, PieChart, Trash2, Search } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import DrawingManager from "@/components/drawing-manager";
import { PointOfInterestMarker } from "@/components/map-component";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { PointOfInterest, typeLabelMap } from "@/lib/data";

interface AnalysisResult {
    totalPoints: number;
    pointsByType: Record<string, number>;
    area: number; // in square meters
}


function TerritoryAnalysisPage() {
    const { allData, loading } = usePoints();
    const [drawnPolygon, setDrawnPolygon] = React.useState<google.maps.Polygon | null>(null);
    const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null);
    const [pointsInPolygon, setPointsInPolygon] = React.useState<PointOfInterest[]>([]);
    const geometry = useMapsLibrary('geometry');

    const handlePolygonComplete = (poly: google.maps.Polygon) => {
        if (drawnPolygon) {
            drawnPolygon.setMap(null); // Clear previous polygon if it exists
        }
        setDrawnPolygon(poly);
        setAnalysisResult(null); // Clear previous results when a new polygon is drawn
        setPointsInPolygon([]);
    };
    
    const handleRunAnalysis = () => {
        if (!drawnPolygon || !geometry || !drawnPolygon.getMap()) {
            setAnalysisResult(null);
            setPointsInPolygon([]);
            return;
        };

        const path = drawnPolygon.getPath();
        if (!path || path.getLength() === 0) {
            setAnalysisResult(null);
            setPointsInPolygon([]);
            return;
        }

        const googlePolygon = new google.maps.Polygon({paths: path.getArray()});
        
        const pointsInside = allData.filter(poi => {
            const poiLatLng = new google.maps.LatLng(poi.position.lat, poi.position.lng);
            return geometry.spherical.containsLocation(poiLatLng, googlePolygon);
        });

        setPointsInPolygon(pointsInside);

        const pointsByType = pointsInside.reduce((acc, poi) => {
            const typeName = typeLabelMap[poi.type] || 'Outro';
            acc[typeName] = (acc[typeName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const area = geometry.spherical.computeArea(path);
        
        setAnalysisResult({
            totalPoints: pointsInside.length,
            pointsByType,
            area
        });
    };
    
     const handleClearAnalysis = () => {
        if (drawnPolygon) {
            drawnPolygon.setMap(null);
        }
        setDrawnPolygon(null);
        setAnalysisResult(null);
        setPointsInPolygon([]);
    };


    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['drawing', 'geometry']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Análise de Território
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="md:col-span-1 lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5"/> Painel de Análise</CardTitle>
                                <CardDescription>Desenhe um polígono no mapa e depois clique em "Analisar Área" para ver os resultados.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={handleRunAnalysis} disabled={!drawnPolygon || drawnPolygon.getPath().getLength() === 0}>
                                    <Search className="mr-2 h-4 w-4"/>
                                    Analisar Área
                                </Button>
                                {analysisResult ? (
                                    <>
                                        <div className="p-3 bg-primary/10 rounded-md">
                                            <p className="font-bold text-primary">{analysisResult.totalPoints.toLocaleString('pt-PT')}</p>
                                            <p className="text-xs font-semibold text-primary/80">Total de Pontos Encontrados</p>
                                        </div>
                                         <div className="p-3 bg-muted rounded-md">
                                            <p className="font-bold">{(analysisResult.area / 10000).toFixed(2).toLocaleString('pt-PT')} ha</p>
                                            <p className="text-xs font-semibold text-muted-foreground">Área Analisada (hectares)</p>
                                        </div>
                                        <h4 className="font-semibold text-sm pt-2">Detalhes por Tipo:</h4>
                                        <div className="space-y-1 text-sm">
                                            {Object.keys(analysisResult.pointsByType).length > 0 ? (
                                                Object.entries(analysisResult.pointsByType).map(([type, count]) => (
                                                    <div key={type} className="flex justify-between items-center">
                                                        <span className="text-muted-foreground">{type}</span>
                                                        <span className="font-medium">{count}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted-foreground text-xs">Nenhum ponto encontrado na área.</p>
                                            )}
                                        </div>
                                        <Button onClick={handleClearAnalysis} variant="destructive" className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            Limpar Análise
                                        </Button>
                                    </>
                                ) : (
                                     <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                        Use as ferramentas no topo do mapa para desenhar uma área e depois clique em "Analisar Área".
                                     </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card className="h-[calc(100vh-10rem)]">
                             <Map
                                mapId="territory-analysis-map"
                                defaultCenter={{ lat: -12.5, lng: 18.5 }}
                                defaultZoom={6}
                                gestureHandling={'greedy'}
                                disableDefaultUI={false}
                            >
                                <DrawingManager onPolygonComplete={handlePolygonComplete}/>
                                {loading ? null : (
                                    (pointsInPolygon.length > 0 ? pointsInPolygon : allData).map(point => (
                                        <PointOfInterestMarker
                                            key={point.id}
                                            point={point}
                                            onClick={() => {}}
                                            onMouseOut={() => {}}
                                            onMouseOver={() => {}}
                                        />
                                    ))
                                )}
                            </Map>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(TerritoryAnalysisPage, ['Agente Municipal', 'Administrador']);
