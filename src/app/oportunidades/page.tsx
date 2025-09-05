
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Briefcase, Users, Search, Route, ShieldCheck, BarChart3, HardHat } from "lucide-react";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

const opportunities = [
    {
        category: "Empregos Diretos no Ecossistema MUNITU",
        description: "Funções que surgem diretamente da necessidade de operar e gerir a plataforma a nível municipal.",
        items: [
            {
                icon: BarChart3,
                title: "Gestor de Plataforma Municipal",
                details: "Profissionais contratados pelas administrações para gerir o painel da MUNITU, analisar os dados recebidos, gerar relatórios para os decisores e coordenar as respostas aos incidentes reportados pelos cidadãos."
            },
            {
                icon: HardHat,
                title: "Fiscal Digital",
                details: "Agentes de campo (fiscais de obras, ambiente, etc.) equipados com a app móvel da MUNITU para verificar reportes, inspecionar obras em tempo real e atualizar o estado dos processos diretamente do terreno, eliminando a papelada."
            },
            {
                icon: Search,
                title: "Técnico de Cadastro Geoespacial",
                details: "Especialistas em SIG (Sistemas de Informação Geográfica) e topografia, responsáveis por mapear novos loteamentos, infraestruturas (água, saneamento, eletricidade) e manter a base de dados geoespacial da cidade precisa e atualizada."
            }
        ]
    },
    {
        category: "Novas Oportunidades de Negócio",
        description: "Serviços e empresas que podem ser criados para dar resposta às novas necessidades e eficiências geradas pela plataforma.",
        items: [
            {
                icon: ShieldCheck,
                title: "Serviços de Verificação de Imóveis",
                details: "Pequenas empresas ou consultores independentes que ajudam os cidadãos a reunir a documentação necessária e a submeter os seus imóveis ao processo de verificação MUNITU, facilitando a obtenção do 'Selo de Confiança Ouro/Prata'."
            },
            {
                icon: Users,
                title: "Agregador de Prestadores de Serviços Verificados",
                details: "Um marketplace onde arquitetos, engenheiros, eletricistas e outros profissionais podem pagar uma subscrição para serem listados como 'Prestadores Verificados MUNITU', ganhando credibilidade e sendo recomendados para resolver os problemas reportados pelos cidadãos."
            },
            {
                icon: Route,
                title: "Logística de 'Última Milha' com Croquis",
                details: "Empresas de entrega que utilizam o módulo de Croquis e a otimização de rotas da MUNITU para criar serviços de entrega hiper-eficientes em áreas de difícil acesso, oferecendo uma vantagem competitiva."
            }
        ]
    }
];

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

export default function OpportunitiesPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                    <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'opportunities-map'}
                    />
                </div>
                <div className="relative z-10 flex flex-1 flex-col bg-transparent">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                        <Button size="icon" variant="outline" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Voltar</span>
                            </Link>
                        </Button>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            Oportunidades de Emprego e Negócio
                        </h1>
                    </header>
                    <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                        <Card>
                             <CardHeader className="text-center">
                                <CardTitle className="text-3xl">Criando um Ecossistema de Oportunidades</CardTitle>
                                <CardDescription className="max-w-2xl mx-auto">
                                    A MUNITU é mais do que uma plataforma; é um motor para o desenvolvimento económico local, capacitando profissionais e fomentando o empreendedorismo.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                       
                        {opportunities.map((opportunity, index) => (
                             <Card key={index}>
                                <CardHeader>
                                    <CardTitle>{opportunity.category}</CardTitle>
                                    <CardDescription>{opportunity.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {opportunity.items.map((item, itemIndex) => (
                                        <Card key={itemIndex} className="bg-muted/40">
                                            <CardHeader>
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                                                        <item.icon className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{item.details}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </main>
                    <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background/80 backdrop-blur-sm">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                            <p>&copy; 2024 MUNITU. Todos os direitos reservados.</p>
                            <Link href="/docs" className="underline hover:text-primary">Documentação Técnica</Link>
                            <Link href="/artigo-cientifico" className="underline hover:text-primary">Artigo Científico</Link>
                            <Link href="/funcionalidades" className="underline hover:text-primary">Funcionalidades</Link>
                             <Link href="/exemplos-de-uso" className="underline hover:text-primary">Exemplos de Uso</Link>
                             <Link href="/monetizacao" className="underline hover:text-primary">Monetização</Link>
                             <Link href="/oportunidades" className="underline hover:text-primary">Oportunidades</Link>
                            <Link href="/termos-e-condicoes" className="underline hover:text-primary">Termos e Condições</Link>
                            <Link href="/politica-de-privacidade" className="underline hover:text-primary">Política de Privacidade</Link>
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

