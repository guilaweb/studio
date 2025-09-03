
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Logo } from "@/components/icons";
import { GenericPolygonsRenderer } from "@/components/generic-polygons-renderer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMapsLibrary } from "@vis.gl/react-google-maps";


const RouteRenderer: React.FC<{
    route: google.maps.LatLngLiteral[];
}> = ({ route }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!map || !route || route.length === 0) return;
        
        const polyline = new google.maps.Polyline({
            path: route,
            geodesic: true,
            strokeColor: 'hsl(var(--accent))',
            strokeOpacity: 0.9,
            strokeWeight: 5,
            icons: [{
                icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW },
                offset: '100%',
                repeat: '50px'
            }],
            map: map,
        });

        return () => {
            polyline.setMap(null);
        };
    }, [map, route]);

    return null;
};


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
    if (!calculatedArea && geometry && croqui.polygon && croqui.polygon.length > 2) {
        calculatedArea = geometry.spherical.computeArea(croqui.polygon);
    }
    
    // Placeholder for UTM-like coordinates
    const simulateUTM = (lat: number, lng: number) => {
        return {
            este: 250000 + (lng * 1000),
            norte: 8320000 + (lat * 1000),
        }
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex flex-col bg-background text-foreground print:p-0 p-8">
                <header className="flex flex-col items-center mb-6 print:mb-4">
                    <Logo className="h-10 w-10 text-primary" />
                    <h1 className="text-2xl font-bold mt-2">Croqui de Localização</h1>
                    <p className="text-muted-foreground">Mapa de Localização</p>
                </header>

                <div className="w-full h-[50vh] border rounded-md overflow-hidden mb-6 print:h-[40vh] print:break-inside-avoid">
                     <Map
                        mapId={`croqui-doc-${croqui.id}`}
                        defaultCenter={croqui.position}
                        defaultZoom={16}
                        gestureHandling="greedy"
                        mapTypeId={'satellite'}
                    >
                        {croqui.polygon && (
                            <GenericPolygonsRenderer
                                plots={[croqui]}
                                selectedPlotId={null}
                                onPlotClick={() => {}}
                            />
                        )}
                        <AdvancedMarker position={croqui.position} title={croqui.title}>
                            <Pin background={'hsl(var(--primary))'} borderColor={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary-foreground))'} />
                        </AdvancedMarker>
                    </Map>
                </div>
                
                 <div className="print:break-inside-avoid">
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
                    <div className="text-sm">
                        <p><strong>REQUERENTE:</strong> {croqui.customData?.requesterName || 'N/A'}</p>
                        <p><strong>Província:</strong> {croqui.customData?.province || 'N/A'}</p>
                        <p><strong>Município:</strong> {croqui.customData?.municipality || 'N/A'}</p>
                        {calculatedArea && <p><strong>Área:</strong> {calculatedArea.toFixed(2)} m²</p>}
                        <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-PT')}</p>
                    </div>
                    <div className="text-right">
                         <div className="flex items-center justify-end gap-2 font-semibold">
                            <Logo className="h-5 w-5"/> MUNITU
                        </div>
                        <div className="border-t-2 border-b-2 border-foreground my-1 py-1 px-2">
                             Escala Gráfica: ≈ 50m
                        </div>
                    </div>
                </footer>
            </div>
        </APIProvider>
    );
}
