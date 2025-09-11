
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Layers, Bike, Trash2, Search, Route } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import DrawingManager from "@/components/drawing-manager";
import { PointOfInterestMarker } from "@/components/map-component";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { PointOfInterest, typeLabelMap } from "@/lib/data";

interface AnalysisResult {
    totalLength: number; // in meters
}


function BikeLanePlanningPage() {
    const { allData, loading } = usePoints();
    const [drawnPolyline, setDrawnPolyline] = React.useState<google.maps.Polyline | null>(null);
    const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null);
    const geometry = useMapsLibrary('geometry');

    const handlePolylineComplete = (poly: google.maps.Polyline | null) => {
        if (drawnPolyline) {
            drawnPolyline.setMap(null);
        }
        // @ts-ignore
        setDrawnPolyline(poly);
        if(!poly) {
             handleClearAnalysis();
        }
    };
    
    const handleRunAnalysis = () => {
        if (!drawnPolyline || !geometry || !drawnPolyline.getMap()) {
            setAnalysisResult(null);
            return;
        };

        const path = drawnPolyline.getPath();
        if (!path || path.getLength() === 0) {
            setAnalysisResult(null);
            return;
        }

        const length = geometry.spherical.computeLength(path);
        
        setAnalysisResult({
            totalLength: length,
        });
    };
    
     const handleClearAnalysis = () => {
        if (drawnPolyline) {
            // @ts-ignore
            drawnPolyline.setMap(null);
        }
        setDrawnPolyline(null);
        setAnalysisResult(null);
    };


    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['drawing', 'geometry']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/transportes">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Planeamento de Ciclovias
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="md:col-span-1 lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bike className="h-5 w-5"/> Painel de Planeamento</CardTitle>
                                <CardDescription>Desenhe uma proposta de ciclovia no mapa e depois clique em "Analisar Rota" para ver os detalhes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={handleRunAnalysis} disabled={!drawnPolyline}>
                                    <Search className="mr-2 h-4 w-4"/>
                                    Analisar Rota
                                </Button>
                                {analysisResult ? (
                                    <>
                                        <div className="p-3 bg-primary/10 rounded-md">
                                            <p className="font-bold text-primary">{(analysisResult.totalLength / 1000).toFixed(2).toLocaleString('pt-PT')} km</p>
                                            <p className="text-xs font-semibold text-primary/80">Comprimento da Rota</p>
                                        </div>
                                        <Button onClick={handleClearAnalysis} variant="destructive" className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            Limpar Rota
                                        </Button>
                                    </>
                                ) : (
                                     <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                        Use as ferramentas no topo do mapa para desenhar uma rota e depois clique em "Analisar".
                                     </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card className="h-[calc(100vh-10rem)]">
                             <Map
                                mapId="ciclovia-planning-map"
                                defaultCenter={{ lat: -8.83, lng: 13.23 }}
                                defaultZoom={13}
                                gestureHandling={'greedy'}
                                disableDefaultUI={false}
                            >
                                <DrawingManager onPolygonComplete={() => {}} />
                                {loading ? null : (
                                    allData.map(point => (
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

export default withAuth(BikeLanePlanningPage, ['Agente Municipal', 'Administrador']);

    