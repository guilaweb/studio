
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Droplets, Database, Activity, GitBranch, BrainCircuit, CheckSquare, Layers, MapPin, Factory, AlertTriangle, CloudRain, Wind, FileSignature, Search, BarChart, FlaskConical, PlusCircle } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterestMarker } from "@/components/map-component";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const features = [
    {
        category: "Cadastro de Recursos Hídricos",
        Icon: Database,
        description: "O Inventário SIG completo da nação.",
        items: [
            {
                title: "Visualizador de Camadas Hidrográficas",
                Icon: Layers,
                points: [
                    "Rede Fluvial: Mapeamento de todos os rios (principais e afluentes) e riachos, com atributos como nome, comprimento e caudal médio.",
                    "Corpos de Água: Mapeamento de lagos, lagoas e chanas, com dados de área e volume estimado.",
                    "Bacias e Sub-bacias Hidrográficas: Delimitação visual de todas as bacias de drenagem, a unidade fundamental para a gestão da água.",
                    "Mapa de Aquíferos: Mapeamento das reservas de água subterrânea, indicando profundidade, vulnerabilidade e potencial."
                ]
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

const WaterBalanceDashboard = ({ watersheds }: { watersheds: any[] }) => {
    const [selectedWatershed, setSelectedWatershed] = React.useState<any | null>(null);

    const disponibilidade = selectedWatershed?.customData?.['Disponibilidade Anual (hm³)'] || 0;
    const procura = selectedWatershed?.customData?.['Procura Total (hm³)'] || 0;
    const balanco = disponibilidade - procura;
    
    let stressPercentage = 0;
    let stressColor = 'bg-green-500';

    if (disponibilidade > 0) {
        const ratio = procura / disponibilidade;
        if (ratio < 0.2) { // Low stress
            stressPercentage = ratio * 100;
            stressColor = 'bg-green-500';
        } else if (ratio < 0.4) { // Medium stress
            stressPercentage = ratio * 100;
            stressColor = 'bg-yellow-500';
        } else { // High stress
            stressPercentage = Math.min(ratio * 100, 100);
            stressColor = 'bg-red-500';
        }
    } else if (procura > 0) {
        stressPercentage = 100;
        stressColor = 'bg-red-500';
    }


    return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-6 w-6 text-primary" />
                    Balanço Hídrico
                </CardTitle>
                <CardDescription>Análise da disponibilidade vs. procura de água por bacia hidrográfica.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select onValueChange={(id) => setSelectedWatershed(watersheds.find(w => w.id === id) || null)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione uma Bacia Hidrográfica" />
                    </SelectTrigger>
                    <SelectContent>
                        {watersheds.map(ws => (
                            <SelectItem key={ws.id} value={ws.id}>{ws.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedWatershed && (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <Label>Disponibilidade (Oferta)</Label>
                                <span className="font-semibold">{disponibilidade} hm³/ano</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <Label>Uso Total (Procura)</Label>
                                <span className="font-semibold">{procura} hm³/ano</span>
                            </div>
                             <div className="flex justify-between text-sm font-bold">
                                <Label>Balanço</Label>
                                <span className={balanco >= 0 ? 'text-green-600' : 'text-red-600'}>{balanco.toFixed(2)} hm³/ano</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Indicador de Stress Hídrico ({stressPercentage.toFixed(0)}%)</Label>
                            <Progress value={stressPercentage} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:via-yellow-400 [&>div]:to-red-500" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const ScenarioSimulator = () => {
    const { toast } = useToast();
    const [irrigation, setIrrigation] = React.useState([5]);
    const [precipitation, setPrecipitation] = React.useState([-10]);
    const [industrial, setIndustrial] = React.useState([15]);

    const handleRunSimulation = () => {
        toast({
            title: "Simulação em Curso (Demonstração)",
            description: "Numa aplicação real, os resultados da simulação seriam agora calculados e exibidos no mapa.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    Simulador de Cenários ('What If?')
                </CardTitle>
                <CardDescription>Modele o impacto de diferentes variáveis na bacia hidrográfica selecionada.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="infraestrutura">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="infraestrutura">Infraestrutura</TabsTrigger>
                        <TabsTrigger value="clima">Clima</TabsTrigger>
                        <TabsTrigger value="uso">Conflitos de Uso</TabsTrigger>
                    </TabsList>
                    <TabsContent value="infraestrutura" className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="irrigation-slider">Aumentar capacidade de irrigação ({irrigation[0]}%)</Label>
                            <Slider id="irrigation-slider" defaultValue={[5]} max={100} step={5} onValueChange={setIrrigation}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-dam">Adicionar Nova Barragem</Label>
                            <Select disabled><SelectTrigger id="new-dam"><SelectValue placeholder="Selecione um projeto de barragem" /></SelectTrigger></Select>
                        </div>
                    </TabsContent>
                    <TabsContent value="clima" className="pt-4 space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="precipitation-slider">Redução de Precipitação ({precipitation[0]}%)</Label>
                            <Slider id="precipitation-slider" defaultValue={[-10]} min={-50} max={0} step={5} onValueChange={setPrecipitation}/>
                        </div>
                    </TabsContent>
                    <TabsContent value="uso" className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="industrial-slider">Aumentar Procura Industrial ({industrial[0]}%)</Label>
                            <Slider id="industrial-slider" defaultValue={[15]} max={100} step={5} onValueChange={setIndustrial}/>
                        </div>
                    </TabsContent>
                </Tabs>
                <Button className="w-full mt-6" onClick={handleRunSimulation}>Executar Simulação</Button>
            </CardContent>
        </Card>
    );
};


function WaterResourcesPage() {
    const { allData } = usePoints();
    
    const waterResources = React.useMemo(() => {
        return allData.filter(p => p.type === 'water_resource');
    }, [allData]);
    
    const watersheds = React.useMemo(() => {
        return waterResources.filter(p => p.title.toLowerCase().includes('bacia'));
    }, [waterResources]);

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
                        <WaterBalanceDashboard watersheds={watersheds} />
                        <ScenarioSimulator />
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
