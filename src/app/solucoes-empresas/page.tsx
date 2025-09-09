"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Briefcase, Droplets, ShoppingBasket, School, Zap, BarChart3, Building, Users, ShieldCheck, Route, HardHat, Search } from "lucide-react";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

const services = [
    {
        category: "Infraestrutura e Serviços Urbanos Essenciais",
        description: "Nesta categoria, o mapeamento preciso de redes e ativos é fundamental para a operação, manutenção e planejamento da expansão dos serviços.",
        items: [
            {
                title: "Saneamento Básico",
                details: "Empresas responsáveis pelos serviços de água e esgoto utilizam o SIG para mapear toda a rede de distribuição e coleta. Isso inclui a localização de tubulações, hidrômetros, válvulas e estações de tratamento. O sistema permite identificar áreas com maior incidência de vazamentos, planejar manutenções preventivas e gerenciar a expansão da rede para novas áreas."
            },
            {
                title: "Gestão de Resíduos Sólidos",
                details: "A coleta de lixo pode ser otimizada através do mapeamento das rotas dos caminhões, da localização dos contentores e da identificação de áreas com maior geração de resíduos. Empresas privadas podem usar o SIG para planejar rotas mais eficientes, reduzir o consumo de combustível e garantir a cobertura completa da cidade."
            },
            {
                title: "Iluminação Pública",
                details: "O cadastro de todos os pontos de iluminação da cidade em um SIG facilita a gestão da manutenção. É possível registrar o tipo de lâmpada de cada poste, seu estado de conservação e o histórico de reparos. Com isso, empresas podem planejar a substituição de lâmpadas de forma proativa e otimizar o atendimento a chamados."
            }
        ]
    },
    {
        category: "Meio Ambiente e Sustentabilidade",
        description: "O monitoramento e a gestão ambiental são áreas em que o SIG se mostra uma ferramenta poderosa para empresas que prestam serviços a municípios.",
        items: [
            {
                title: "Monitoramento Ambiental",
                details: "Empresas especializadas podem utilizar imagens de satélite e dados de sensores para monitorar áreas de preservação ambiental, identificar focos de desmatamento, queimadas e ocupações irregulares. O SIG permite a análise da evolução do uso do solo e a criação de alertas para áreas de risco."
            },
            {
                title: "Gestão de Áreas Verdes",
                details: "O mapeamento de parques, praças e árvores da cidade auxilia no planejamento de podas, na irrigação e no controle de pragas. Empresas de paisagismo e manutenção de áreas verdes podem utilizar o SIG para gerenciar suas equipes e garantir a conservação desses espaços."
            }
        ]
    },
    {
        category: "Transporte e Mobilidade Urbana",
        description: "A otimização do fluxo de pessoas e veículos é um dos grandes desafios das cidades modernas, e o SIG é um aliado fundamental.",
        items: [
            {
                title: "Gestão de Transporte Público",
                details: "Empresas concessionárias podem mapear as linhas, pontos de parada e horários. A análise de dados de GPS dos veículos em tempo real permite o monitoramento da pontualidade e o planejamento de ajustes nas rotas."
            },
            {
                title: "Planejamento de Ciclovias",
                details: "Empresas de consultoria em mobilidade podem usar o SIG para analisar a infraestrutura existente e propor a criação de novas ciclovias e rotas seguras para pedestres, conectando pontos de interesse na cidade."
            }
        ]
    },
    {
        category: "Segurança e Planejamento",
        description: "A análise espacial de dados e o planejamento de respostas a desastres são cruciais para a segurança dos cidadãos.",
        items: [
            {
                title: "Monitoramento e Análise Criminal",
                details: "Empresas de segurança privada podem mapear a ocorrência de crimes, identificando 'manchas criminais' para direcionar o patrulhamento e implementar estratégias de prevenção."
            },
            {
                title: "Gestão de Desastres Naturais",
                details: "O SIG é utilizado para mapear áreas de risco de enchentes e deslizamentos. Empresas de consultoria podem desenvolver planos de evacuação e de resposta a emergências."
            },
            {
                title: "Cadastro Territorial e Zoneamento",
                details: "O mapeamento de lotes e edificações é a base para o planejamento urbano. Empresas especializadas podem desenvolver e manter esses cadastros, que servem de base para o cálculo de impostos e para a regularização fundiária."
            }
        ]
    },
];

export default function PrivateSectorSolutionsPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                    <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'private-solutions-map'}
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
                            Soluções para Empresas Privadas
                        </h1>
                    </header>
                    <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                         <Card>
                             <CardHeader className="text-center">
                                <CardTitle className="text-3xl">Mapeando o Futuro das Cidades com SIG</CardTitle>
                                <CardDescription className="max-w-3xl mx-auto">
                                    Empresas privadas estão cada vez mais prestando uma vasta gama de serviços a municípios. A MUNITU é a plataforma que conecta essa experiência com as necessidades da gestão pública, utilizando Sistemas de Informação Geográfica (SIG) para otimizar operações e promover um desenvolvimento urbano mais inteligente.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        {services.map((service, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle>{service.category}</CardTitle>
                                    <CardDescription>{service.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {service.items.map((item, itemIndex) => (
                                        <Card key={itemIndex} className="bg-muted/40">
                                            <CardHeader>
                                                <CardTitle className="text-lg">{item.title}</CardTitle>
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
                            <Link href="/solucoes-empresas" className="underline hover:text-primary">Soluções para Empresas</Link>
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
