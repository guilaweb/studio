
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, GitBranch } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

function LandUsePage() {
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
                        Mapa de Cobertura e Uso do Solo
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="md:col-span-1 lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Legenda e Ferramentas</CardTitle>
                                <CardDescription>Funcionalidades em desenvolvimento.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Em breve poderá visualizar as diferentes classificações de uso do solo, como áreas agrícolas, florestais e urbanas, e utilizar ferramentas para análise de desflorestação e identificação de terras aráveis.</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card className="h-[calc(100vh-10rem)]">
                             <Map
                                mapId="land-use-map"
                                defaultCenter={{ lat: -12.5, lng: 18.5 }} // Centered broadly on Angola
                                defaultZoom={6}
                                gestureHandling={'greedy'}
                                disableDefaultUI={true}
                            >
                                {/* Future layers will be rendered here */}
                            </Map>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(LandUsePage, ['Agente Municipal', 'Administrador']);
