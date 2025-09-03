
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Layers, AreaChart, Tractor } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useExternalLayers } from "@/services/external-layers-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function LandUsePage() {
    const { externalLayers, loading } = useExternalLayers();
    const { toast } = useToast();
    
    const landCoverLayer = React.useMemo(() => {
        return externalLayers.find(l => l.name.toLowerCase().includes('uso do solo'));
    }, [externalLayers]);

    const legendItems = [
        { color: 'bg-green-700', label: 'Floresta' },
        { color: 'bg-yellow-500', label: 'Agricultura' },
        { color: 'bg-red-600', label: 'Área Urbana' },
        { color: 'bg-blue-500', label: 'Corpos de Água' },
        { color: 'bg-gray-400', label: 'Solo Exposto' },
    ];
    
    const handleAnalysisStart = (analysisType: string) => {
        toast({
            title: "Análise Iniciada (Demonstração)",
            description: `A sua análise de "${analysisType}" começou. Num ambiente de produção, os resultados seriam agora calculados e exibidos no mapa.`,
        });
    }

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
                                <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5"/> Legenda</CardTitle>
                                <CardDescription>Classificação de uso do solo.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                               {legendItems.map(item => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div className={`h-4 w-4 rounded-full ${item.color}`} />
                                        <span className="text-sm">{item.label}</span>
                                    </div>
                               ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Ferramentas de Análise</CardTitle>
                                <CardDescription>Execute análises para identificar mudanças e potencialidades no território.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="deforestation">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="deforestation">Desflorestação</TabsTrigger>
                                        <TabsTrigger value="arable">Terras Aráveis</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="deforestation" className="pt-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Período de Análise</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Select><SelectTrigger><SelectValue placeholder="Ano Inicial"/></SelectTrigger><SelectContent><SelectItem value="2020">2020</SelectItem><SelectItem value="2022">2022</SelectItem></SelectContent></Select>
                                                <Select><SelectTrigger><SelectValue placeholder="Ano Final"/></SelectTrigger><SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent></Select>
                                            </div>
                                        </div>
                                        <Button className="w-full" onClick={() => handleAnalysisStart('Desflorestação')}>
                                            <AreaChart className="mr-2 h-4 w-4"/>
                                            Analisar Desflorestação
                                        </Button>
                                    </TabsContent>
                                    <TabsContent value="arable" className="pt-4 space-y-4">
                                         <div className="space-y-2">
                                            <Label htmlFor="culture-type">Tipo de Cultura Potencial</Label>
                                            <Select>
                                                <SelectTrigger id="culture-type"><SelectValue placeholder="Selecione a cultura" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="milho">Milho</SelectItem>
                                                    <SelectItem value="soja">Soja</SelectItem>
                                                    <SelectItem value="horticolas">Hortícolas</SelectItem>
                                                    <SelectItem value="fruticultura">Fruticultura</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="min-area">Área Mínima (hectares)</Label>
                                            <Input id="min-area" type="number" placeholder="Ex: 500" />
                                        </div>
                                        <Button className="w-full" onClick={() => handleAnalysisStart('Identificação de Terras Aráveis')}>
                                            <Tractor className="mr-2 h-4 w-4"/>
                                            Identificar Terras Aráveis
                                        </Button>
                                    </TabsContent>
                                </Tabs>
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
                                mapTypeId={'satellite'}
                                disableDefaultUI={true}
                            >
                                {loading ? <Skeleton className="h-full w-full"/> : (
                                    <>
                                     {/* Future WMS/WFS layers will be rendered here from the service */}
                                    </>
                                )}
                            </Map>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(LandUsePage, ['Agente Municipal', 'Administrador']);
