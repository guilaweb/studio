
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Bot, Sun, HelpCircle, Code } from "lucide-react";
import { APIProvider, Map, MapControl, ControlPosition } from "@vis.gl/react-google-maps";
import { SolarAnalysis } from "@/components/urban-planning/solar-analysis";
import ShadowSimulator from "@/components/urban-planning/shadow-simulator";

function UrbanPlanning3DPage() {
    const [map, setMap] = React.useState<google.maps.Map | null>(null);

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places', 'geometry', 'three']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Planeamento Urbano 3D
                    </h1>
                    <Card className="flex items-center gap-2 p-2 rounded-lg">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardDescription className="text-xs">
                           Módulo experimental. É necessário um Map ID com "Photorealistic 3D Tiles" ativo.
                        </CardDescription>
                    </Card>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="md:col-span-1 lg:col-span-1 space-y-4">
                       <SolarAnalysis map={map} />
                       <ShadowSimulator map={map} />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card className="h-[calc(100vh-10rem)]">
                            <Map
                                ref={setMap}
                                mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_3D_MAP_ID || 'DEMO_MAP_ID'}
                                defaultCenter={{ lat: -8.8145, lng: 13.2307 }}
                                defaultZoom={18}
                                gestureHandling={'greedy'}
                                tilt={45}
                                heading={45}
                                disableDefaultUI={true}
                            >
                                <MapControl position={ControlPosition.TOP_RIGHT}>
                                    <div className="m-2 p-2 bg-background rounded-md shadow-lg text-xs text-muted-foreground">
                                        Use Ctrl + Arrastar para inclinar e rodar
                                    </div>
                                </MapControl>
                            </Map>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(UrbanPlanning3DPage, ['Agente Municipal', 'Administrador']);
