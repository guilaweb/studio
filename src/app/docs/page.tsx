
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

const pointOfInterestExample = `
{
  "id": "incident-1754013627883",
  "type": "incident",
  "position": { "lat": -8.8368, "lng": 13.2343 },
  "title": "Colisão Grave",
  "description": "Acidente entre dois veículos no cruzamento principal.",
  "status": "unknown",
  "priority": "high",
  "lastReported": "2024-05-26T12:40:27.883Z",
  "authorId": "user123",
  "updates": [
    {
      "id": "update-01",
      "text": "Acidente entre dois veículos no cruzamento principal.",
      "authorId": "user123",
      "authorDisplayName": "Nome do Cidadão",
      "timestamp": "2024-05-26T12:40:27.883Z"
    }
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
                        styles={mapStyles}
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
                                <CardTitle>Sistema Geodésico Nacional</CardTitle>
                                <CardDescription>
                                    Informações sobre o sistema de referência e projeção a ser utilizado em projetos de engenharia e arquitetura.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Datum de Referência</h3>
                                    <p className="text-muted-foreground">
                                        O datum geodésico de referência para Angola é o **WGS 84 (World Geodetic System 1984)**. Todos os levantamentos e projetos devem utilizar este sistema para garantir a compatibilidade e precisão dos dados geográficos a nível nacional e internacional.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Sistema de Projeção</h3>
                                    <p className="text-muted-foreground">
                                        O sistema de projeção cartográfica adotado é a **Projeção Universal Transversa de Mercator (UTM)**. O território de Angola abrange as seguintes zonas UTM:
                                    </p>
                                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                        <li><strong>Zona 32 Sul:</strong> Para a província de Cabinda.</li>
                                        <li><strong>Zona 33 Sul:</strong> Para a maior parte do território continental, a oeste do meridiano 18°E.</li>
                                        <li><strong>Zona 34 Sul:</strong> Para a faixa oriental do país, a leste do meridiano 18°E.</li>
                                    </ul>
                                    <p className="text-sm text-muted-foreground pt-2">
                                        É da responsabilidade do técnico responsável pelo projeto selecionar a zona UTM correta com base na localização geográfica da obra para garantir a máxima precisão cartográfica.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Notas Adicionais</h3>
                                    <p className="text-muted-foreground">
                                        A precisão na georreferenciação de projetos é fundamental para o planeamento urbano, gestão de infraestruturas e segurança jurídica. A conformidade com estas normas é obrigatória para a aprovação de processos de licenciamento. Para mais detalhes técnicos, consulte a documentação oficial do Instituto Geográfico e Cadastral de Angola (IGCA).
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                    <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background/80 backdrop-blur-sm">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                            <p>&copy; 2024 MUNITU. Todos os direitos reservados.</p>
                            <Link href="/docs" className="underline hover:text-primary">Documentação Técnica</Link>
                            <Link href="/funcionalidades" className="underline hover:text-primary">Funcionalidades</Link>
                            <Link href="/exemplos-de-uso" className="underline hover:text-primary">Exemplos de Uso</Link>
                            <Link href="/termos-e-condicoes" className="underline hover:text-primary">Termos e Condições</Link>
                            <Link href="/help" className="underline hover:text-primary">Ajuda</Link>
                        </div>
                        <div className="sm:ml-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground text-center sm:text-right">
                            <div>
                                <p className="font-semibold">Dianguila Empreendimentos, (SU), Lda.</p>
                                <p>NIF: 5001706802 | Matrícula: 39110-23/231102</p>
                                <p>Acto de Constituição: Insc.1 Ap.419/231102</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </APIProvider>
    );
}
