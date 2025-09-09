
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Briefcase, Droplets, ShoppingBasket, School, Zap, BarChart3, Building, Users, ShieldCheck, Route, HardHat, Search } from "lucide-react";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { Logo } from "@/components/icons";

const services = [
    {
        category: "Infraestrutura e Serviços Urbanos Essenciais",
        description: "Nesta categoria, o mapeamento preciso de redes e ativos é fundamental para a operação, manutenção e planejamento da expansão dos serviços.",
        items: [
            {
                title: "Saneamento Básico",
                details: "Empresas responsáveis pelos serviços de água e esgoto utilizam o SIG para mapear toda a rede de distribuição e coleta.[2] Isso inclui a localização de tubulações, hidrômetros, válvulas e estações de tratamento. O sistema permite identificar áreas com maior incidência de vazamentos, planejar manutenções preventivas e gerenciar a expansão da rede para novas áreas.[3]"
            },
            {
                title: "Gestão de Resíduos Sólidos",
                details: "A coleta de lixo pode ser otimizada através do mapeamento das rotas dos caminhões, da localização dos contentores e da identificação de áreas com maior geração de resíduos.[4] Empresas privadas podem usar o SIG para planejar rotas mais eficientes, reduzir o consumo de combustível e garantir a cobertura completa da cidade. O sistema também auxilia na localização de áreas adequadas para a instalação de aterros sanitários e unidades de triagem.[4][5]"
            },
            {
                title: "Iluminação Pública",
                details: "O cadastro de todos os pontos de iluminação da cidade em um SIG facilita a gestão da manutenção.[6][7] É possível registrar o tipo de lâmpada de cada poste, seu estado de conservação e o histórico de reparos. Com isso, empresas podem planejar a substituição de lâmpadas de forma proativa, otimizar o atendimento a chamados de reparo e identificar áreas que necessitam de melhorias na iluminação.[8][9]"
            }
        ]
    },
    {
        category: "Meio Ambiente e Sustentabilidade",
        description: "O monitoramento e a gestão ambiental são áreas em que o SIG se mostra uma ferramenta poderosa para empresas que prestam serviços a municípios.",
        items: [
            {
                title: "Monitoramento Ambiental",
                details: "Empresas especializadas podem utilizar imagens de satélite e dados de sensores para monitorar áreas de preservação ambiental, identificar focos de desmatamento, queimadas e ocupações irregulares.[10] O SIG permite a análise da evolução do uso do solo e a criação de alertas para áreas de risco."
            },
            {
                title: "Gestão de Áreas Verdes",
                details: "O mapeamento de parques, praças e árvores da cidade auxilia no planejamento de podas, na irrigação e no controle de pragas. Empresas de paisagismo e manutenção de áreas verdes podem utilizar o SIG para gerenciar suas equipes e garantir a conservação desses espaços."
            }
        ]
    },
    {
        category: "Transporte e Mobilidade Urbana",
        description: "A otimização do fluxo de pessoas e veículos é um dos grandes desafios das cidades modernas, e o SIG é um aliado fundamental para empresas que atuam neste setor.",
        items: [
            {
                title: "Gestão de Transporte Público",
                details: "Empresas concessionárias de transporte público podem mapear as linhas de ônibus, pontos de parada e horários.[11] A análise de dados de GPS dos veículos em tempo real permite o monitoramento da pontualidade, a identificação de gargalos no trânsito e o planejamento de ajustes nas rotas e frequências."
            },
            {
                title: "Planejamento de Ciclovias",
                details: "Empresas de consultoria em mobilidade podem usar o SIG para analisar a infraestrutura existente e propor a criação de novas ciclovias e rotas seguras para pedestres, conectando pontos de interesse na cidade.[12]"
            }
        ]
    },
    {
        category: "Segurança e Planejamento",
        description: "A análise espacial de dados e o planejamento de respostas a desastres são cruciais para a segurança dos cidadãos.",
        items: [
            {
                title: "Monitoramento e Análise Criminal",
                details: "Empresas de segurança privada e consultoria podem mapear a ocorrência de crimes, identificando 'manchas criminais' (áreas com alta incidência).[7] Essa análise ajuda a direcionar o patrulhamento e a implementar estratégias de prevenção."
            },
            {
                title: "Gestão de Desastres Naturais",
                details: "O SIG é utilizado para mapear áreas de risco de enchentes, deslizamentos e outros desastres.[1] Empresas de consultoria podem desenvolver planos de evacuação e de resposta a emergências, identificando rotas de fuga seguras e a localização de abrigos."
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
