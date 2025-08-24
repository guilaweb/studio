
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Droplets, Database, Activity, GitBranch, BrainCircuit, CheckSquare, Layers, MapPin, Factory, AlertTriangle, CloudRain, Wind, FileSignature, Search, BarChart, FlaskConical } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterestMarker } from "@/components/map-component";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
];

const features = [
    {
        category: "Cadastro de Recursos Hídricos",
        Icon: Database,
        description: "O Inventário SIG completo da nação.",
        items: [
            {
                title: "Visualizador de Camadas Hidrográficas",
                Icon: Layers,
                points: ["Rede Fluvial (Rios e Afluentes)", "Corpos de Água (Lagos, Lagoas)", "Bacias e Sub-bacias Hidrográficas", "Mapa de Aquíferos Subterrâneos"]
            },
            {
                title: "Inventário de Infraestruturas Hídricas",
                Icon: CheckSquare,
                points: ["Mapa de Barragens e Albufeiras", "Mapa de Estações de Tratamento (ETA/ETAR)", "Cadastro de Pontos de Captação (Furos, Poços)"]
            },
            {
                title: "Cadastro de Uso e Qualidade da Água",
                Icon: FlaskConical,
                points: ["Mapa de Concessões e Licenças de Uso", "Rede de Monitoramento da Qualidade", "Mapa de Fontes de Poluição Potenciais"]
            }
        ]
    },
    {
        category: "Monitoramento Dinâmico",
        Icon: Activity,
        description: "Acompanhamento em tempo real e colaborativo.",
        items: [
             {
                title: "Painel de Controlo de Sensores (IoT)",
                Icon: BarChart,
                points: ["Visualização de Dados em Tempo Real (Nível, Caudal, pH)", "Alertas Automáticos de Sensores"]
            },
             {
                title: "Portal de 'Ciência Cidadã'",
                Icon: MapPin,
                points: ["Funcionalidade 'Reportar Poluição'", "Funcionalidade 'Monitor Comunitário de Nível'"]
            },
        ]
    },
    {
        category: "Gestão e Governança da Água",
        Icon: GitBranch,
        description: "Ferramentas para uma governação proativa.",
        items: [
             {
                title: "Sistema de Alerta Precoce",
                Icon: AlertTriangle,
                points: ["Motor de Previsão de Cheias", "Monitor de Secas"]
            },
             {
                title: "Fluxo de Trabalho para Licenciamento",
                Icon: FileSignature,
                points: ["Portal de Solicitação Online", "Análise de Impacto Automatizada", "Gestão de Licenças"]
            },
             {
                title: "Painel de Fiscalização Ambiental",
                Icon: Factory,
                points: ["Mapa de Ocorrências de Poluição", "App Móvel do Fiscal"]
            }
        ]
    },
    {
        category: "Análise e Planeamento",
        Icon: BrainCircuit,
        description: "Simulação e planeamento estratégico.",
        items: [
             {
                title: "Ferramenta de 'Balanço Hídrico'",
                Icon: BarChart,
                points: ["Dashboard por Bacia Hidrográfica", "Indicador de Stress Hídrico"]
            },
             {
                title: "Simulador de Cenários ('What If?')",
                Icon: Search,
                points: ["Simulador de Infraestruturas (Barragens, Irrigação)", "Simulador de Alterações Climáticas", "Simulador de Conflitos de Uso"]
            },
             {
                title: "Identificação de Potencialidades",
                Icon: Wind,
                points: ["Análise de Aptidão para Irrigação", "Identificação de Potencial Hidroelétrico"]
            },
        ]
    }
];

function WaterResourcesPage() {
    const { allData } = usePoints();
    
    const waterResources = React.useMemo(() => {
        return allData.filter(p => p.type === 'water_resource');
    }, [allData]);

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
                        Mapa Nacional de Recursos Hídricos
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="md:col-span-1 lg:col-span-1 space-y-4">
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Droplets className="h-6 w-6 text-primary" />
                                    Módulo de Recursos Hídricos
                                </CardTitle>
                                <CardDescription>Um inventário completo e um painel de controlo dinâmico para a gestão da água em Angola.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {features.map((feature, index) => (
                                         <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger>
                                                <div className="flex items-center gap-3">
                                                    <feature.Icon className="h-5 w-5 text-primary" />
                                                    <span>{feature.category}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pl-2">
                                                {feature.items.map((item, itemIndex) => (
                                                    <div key={itemIndex}>
                                                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                                            <item.Icon className="h-4 w-4 text-muted-foreground" />
                                                            {item.title}
                                                        </h4>
                                                        <ul className="list-disc pl-6 text-xs text-muted-foreground space-y-1">
                                                            {item.points.map((point, pointIndex) => (
                                                                <li key={pointIndex}>{point}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card className="h-[calc(100vh-10rem)]">
                            <Map
                                mapId="water-resources-map"
                                defaultCenter={{ lat: -12.5, lng: 18.5 }} // Centered more broadly on Angola
                                defaultZoom={6}
                                gestureHandling={'greedy'}
                                disableDefaultUI={true}
                                styles={mapStyles}
                            >
                                {waterResources.map(point => (
                                    <PointOfInterestMarker
                                        key={point.id}
                                        point={point}
                                        onClick={() => {}}
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

export default withAuth(WaterResourcesPage, ['Agente Municipal', 'Administrador']);
