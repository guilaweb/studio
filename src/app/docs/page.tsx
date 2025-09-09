
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { Logo } from "@/components/icons";

const pointOfInterestExample = `
{
  // Campos Comuns
  "id": "incident-1754013627883",
  "type": "incident", // incident, construction, sanitation, atm, land_plot, etc.
  "position": { "lat": -8.8368, "lng": 13.2343 },
  "title": "Colisão Grave na Avenida Principal",
  "description": "Acidente entre dois veículos no cruzamento principal, com um capotamento. #transito_cortado",
  "status": "in_progress", // Varia por tipo: 'unknown', 'in_progress', 'collected', 'available', 'unavailable', 'approved', 'em_verificacao'
  "priority": "high", // low, medium, high
  "lastReported": "2024-07-30T12:40:27.883Z",
  "authorId": "user123",
  "authorDisplayName": "João Silva",
  "updates": [
    {
      "id": "update-01",
      "text": "Acidente entre dois veículos...",
      "authorId": "user123",
      "authorDisplayName": "João Silva",
      "timestamp": "2024-07-30T12:40:27.883Z",
      "photoDataUri": "data:image/jpeg;base64,..."
    }
  ],
  "files": [{ "name": "Planta.pdf", "url": "https://..." }],

  // Campos Específicos para Lotes e Imóveis
  "propertyType": "land", // land, house, apartment, etc.
  "area": 1200, // m²
  "price": 15000000, // AOA
  "propertyTaxStatus": "paid", // paid, due
  "polygon": [
    { "lat": -8.837, "lng": 13.234 },
    { "lat": -8.837, "lng": 13.235 },
    { "lat": -8.838, "lng": 13.235 },
    { "lat": -8.838, "lng": 13.234 }
  ],
  "usageType": "residential",
  "maxHeight": 4, // pisos
  
  // Campos Específicos para Projetos de Construção
  "landPlotId": "land_plot-12345",
  "projectType": "new-build",
  "architectName": "Maria Costa",
  "workflowSteps": [
    { "id": "step1", "department": "Bombeiros", "reason": "...", "status": "pending" }
  ],

  // Campos Específicos para Croquis
  "croquiType": "urban",
  "collectionName": "Clientes Zona Sul",
  "croquiPoints": [
    { "position": { "lat": -8.836, "lng": 13.233 }, "label": "Rotunda Principal", "type": "munitu" }
  ]
}
`;

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
];

export default function DocsPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                    <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'docs-map'}
                    />
                </div>
                <div className="relative z-10 flex flex-1 flex-col bg-transparent">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                        <Button size="icon" variant="outline" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Voltar ao Mapa</span>
                            </Link>
                        </Button>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            Documentação Técnica
                        </h1>
                    </header>
                    <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Formatos de Dados</CardTitle>
                                <CardDescription>
                                    Entenda a estrutura dos principais objetos de dados utilizados na plataforma.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold">Objeto: PointOfInterest</h3>
                                    <p className="text-muted-foreground text-sm mb-2">
                                        A estrutura base para todos os pontos reportados no mapa.
                                    </p>
                                    <CodeBlock code={pointOfInterestExample} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Sistema Geodésico de Referência</CardTitle>
                                <CardDescription>
                                    Informações sobre o sistema de referência e projeção a ser utilizado em projetos de engenharia e arquitetura.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Datum de Referência</h3>
                                    <p className="text-muted-foreground">
                                        O datum geodésico de referência para a maioria das aplicações globais é o **WGS 84 (World Geodetic System 1984)**. Recomenda-se que todos os levantamentos e projetos utilizem este sistema para garantir a compatibilidade e precisão dos dados geográficos a nível internacional.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Sistema de Projeção</h3>
                                    <p className="text-muted-foreground">
                                        O sistema de projeção cartográfica mais comum para aplicações de engenharia e mapeamento em grande escala é a **Projeção Universal Transversa de Mercator (UTM)**. O globo é dividido em 60 zonas de 6 graus.
                                    </p>
                                    <p className="text-sm text-muted-foreground pt-2">
                                        É da responsabilidade do técnico responsável pelo projeto selecionar a zona UTM correta com base na localização geográfica da obra para garantir a máxima precisão cartográfica. Verifique sempre as normas e regulamentos do instituto geográfico ou cadastral local.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Notas Adicionais</h3>
                                    <p className="text-muted-foreground">
                                        A precisão na georreferenciação de projetos é fundamental para o planeamento urbano, gestão de infraestruturas e segurança jurídica. A conformidade com as normas locais é obrigatória para a aprovação de processos de licenciamento.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                    <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
                        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
                            <div className="grid gap-2 col-span-2 md:col-span-1">
                                <Link href="/" className="flex items-center gap-2 mb-2" prefetch={false}>
                                    <Logo className="h-6 w-6 text-primary" />
                                    <span className="font-semibold text-lg">MUNITU</span>
                                </Link>
                                <p className="text-sm text-muted-foreground">Você faz a cidade. A plataforma digital que conecta cidadãos, empresas e o município para uma governação transparente e eficiente.</p>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <h3 className="font-semibold">Plataforma</h3>
                                <Link href="/funcionalidades" className="text-muted-foreground hover:text-primary" prefetch={false}>Funcionalidades</Link>
                                <Link href="/exemplos-de-uso" className="text-muted-foreground hover:text-primary" prefetch={false}>Exemplos de Uso</Link>
                                <Link href="/solucoes-empresas" className="text-muted-foreground hover:text-primary" prefetch={false}>Soluções para Empresas</Link>
                                <Link href="/governo" className="text-muted-foreground hover:text-primary" prefetch={false}>Soluções para Governo</Link>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <h3 className="font-semibold">Recursos</h3>
                                <Link href="/docs" className="text-muted-foreground hover:text-primary" prefetch={false}>Documentação Técnica</Link>
                                <Link href="/artigo-cientifico" className="text-muted-foreground hover:text-primary" prefetch={false}>Artigo Científico</Link>
                                <Link href="/monetizacao" className="text-muted-foreground hover:text-primary" prefetch={false}>Monetização</Link>
                                <Link href="/oportunidades" className="text-muted-foreground hover:text-primary" prefetch={false}>Oportunidades</Link>
                                <Link href="/help" className="text-muted-foreground hover:text-primary" prefetch={false}>Ajuda</Link>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <h3 className="font-semibold">Legal</h3>
                                <Link href="/termos-e-condicoes" className="text-muted-foreground hover:text-primary" prefetch={false}>Termos e Condições</Link>
                                <Link href="/politica-de-privacidade" className="text-muted-foreground hover:text-primary" prefetch={false}>Política de Privacidade</Link>
                            </div>
                        </div>
                        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t">
                            <p className="text-xs text-muted-foreground">&copy; 2024 MUNITU. Todos os direitos reservados.</p>
                            <div className="text-xs text-muted-foreground text-center sm:text-right">
                                <p className="font-semibold">Dianguila Empreendimentos, (SU), Lda.</p>
                                <p>NIF: 5001706802 | Matrícula: 39110-23/231102</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </APIProvider>
    );
}
