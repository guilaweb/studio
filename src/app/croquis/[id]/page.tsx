

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { Logo } from "@/components/icons";
import { Compass, MapPin, Share2, Phone, FileSignature } from "lucide-react";
import { GenericPolygonsRenderer } from "@/components/generic-polygons-renderer";
import Link from "next/link";
import DirectionsRenderer from "@/components/directions-renderer";

const RoutePointsRenderer: React.FC<{
    points: { position: google.maps.LatLngLiteral; label: string; }[];
}> = ({ points }) => {
    return (
        <>
            {points.map((point, index) => (
                <AdvancedMarker key={index} position={point.position} title={point.label}>
                    <Pin background={'#FB923C'} borderColor={'#F97316'} glyphColor={'#ffffff'} />
                </AdvancedMarker>
            ))}
        </>
    );
};


export default function PublicCroquiPage() {
    const params = useParams();
    const router = useRouter();
    const croquiId = params.id as string;
    const { allData, loading } = usePoints();
    const [croqui, setCroqui] = React.useState<PointOfInterest | null>(null);

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
    
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${croqui.position.lat},${croqui.position.lng}`;

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex h-screen w-full flex-col">
                <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-6 text-primary"/>
                        <span className="font-semibold">{croqui.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                           <Link href={`/croquis/${croqui.id}/documento`} target="_blank">
                                <FileSignature className="mr-2 h-4 w-4"/>
                                Ver para Impressão
                            </Link>
                        </Button>
                        <Button asChild>
                            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                                <Compass className="mr-2 h-4 w-4"/>
                                Navegar até aqui
                            </a>
                        </Button>
                    </div>
                </header>
                <div className="flex-1 grid md:grid-cols-3">
                    <aside className="md:col-span-1 p-4 overflow-y-auto border-r">
                        <Card>
                             <CardHeader>
                                <CardTitle>{croqui.title}</CardTitle>
                                <CardDescription>Criado por {croqui.authorDisplayName}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {croqui.description && (
                                     <div>
                                        <h4 className="font-semibold text-sm">Notas Adicionais:</h4>
                                        <p className="text-sm text-muted-foreground">{croqui.description}</p>
                                    </div>
                                )}
                                {croqui.croquiPoints && croqui.croquiPoints.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm">Pontos de Referência:</h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                                            {croqui.croquiPoints.map((p, i) => <li key={i}>{p.label}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {croqui.authorId && ( // Placeholder for contact info
                                    <Button variant="outline" className="w-full">
                                        <Phone className="mr-2 h-4 w-4"/>
                                        Ligar para o Contacto
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </aside>
                    <main className="md:col-span-2 h-full w-full">
                        <Map
                            mapId={`croqui-view-${croqui.id}`}
                            defaultCenter={croqui.position}
                            defaultZoom={16}
                            gestureHandling="greedy"
                        >
                            <AdvancedMarker position={croqui.position} title={croqui.title}>
                               <Pin background={'hsl(var(--primary))'} borderColor={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary-foreground))'}>
                                   <MapPin />
                               </Pin>
                            </AdvancedMarker>
                            
                            {croqui.croquiPoints && <RoutePointsRenderer points={croqui.croquiPoints} />}
                            
                            {croqui.croquiRoute && <DirectionsRenderer path={croqui.croquiRoute} />}
                            {croqui.polygon && (
                                <GenericPolygonsRenderer
                                    plots={[croqui]}
                                    selectedPlotId={null}
                                    onPlotClick={() => {}}
                                />
                            )}
                        </Map>
                    </main>
                </div>
            </div>
        </APIProvider>
    );
}
