
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Briefcase, Users, Search, Route, ShieldCheck, BarChart3, HardHat } from "lucide-react";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { Logo } from "@/components/icons";

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
                details: "Um marketplace onde arquitetos, engenheiros, eletricistas, oficinas e outros profissionais podem pagar uma subscrição para serem listados como 'Prestadores Verificados MUNITU', ganhando credibilidade e sendo recomendados para resolver os problemas reportados."
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
