
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

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

export default function ScientificArticlePage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                    <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'scientific-article-map'}
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
                            Artigo Científico
                        </h1>
                    </header>
                    <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                        <Card className="prose prose-sm md:prose-base dark:prose-invert max-w-full">
                            <CardHeader>
                                <CardTitle>MUNITU: Uma Plataforma Geoespacial Colaborativa para a Governação Urbana Digital em Angola</CardTitle>
                                <CardDescription>
                                    <strong>Autores:</strong> Dianguila Empreendimentos, (SU), Lda. | <strong>Data:</strong> Julho 2024
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <section>
                                    <h2 className="font-semibold text-lg">Resumo</h2>
                                    <p>A rápida urbanização em Angola apresenta desafios significativos para a governação municipal, incluindo a gestão de infraestruturas, o licenciamento de obras e a participação cívica. Este artigo apresenta a MUNITU, uma plataforma de governação digital que integra um Sistema de Informação Geográfica (SIG) com ferramentas de colaboração social e inteligência artificial. A MUNITU visa criar um ecossistema digital onde cidadãos, empresas e administrações municipais podem interagir de forma transparente e eficiente, promovendo o desenvolvimento urbano sustentável. Descrevemos a arquitetura da plataforma, os seus módulos funcionais chave e o potencial de impacto na otimização de processos, no aumento da transparência e no fomento da participação cidadã.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">1. Introdução</h2>
                                    <p>A governação urbana em contextos de rápido crescimento, como o de Angola, enfrenta uma lacuna de informação e comunicação entre os administradores e os cidadãos. Processos como o licenciamento de obras são frequentemente opacos e burocráticos, enquanto a resposta a problemas de infraestrutura (saneamento, iluminação, etc.) é reativa e ineficiente devido à falta de dados centralizados e em tempo real. A MUNITU foi concebida para abordar estas lacunas, propondo um modelo de "governação como plataforma", onde um mapa interativo serve como a interface principal para a co-criação da cidade.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">2. Metodologia: A Arquitetura MUNITU</h2>
                                    <p>A MUNITU é uma aplicação web progressiva (PWA) construída sobre uma pilha tecnológica moderna, compreendendo Next.js para o frontend e backend, Firebase (Firestore, Auth) para a base de dados em tempo real e autenticação, e a API do Google Maps para a componente geoespacial. A plataforma foi desenhada com uma arquitetura modular e escalável.</p>
                                    <p>O núcleo da plataforma é o objeto `PointOfInterest` (POI), uma estrutura de dados flexível que representa qualquer entidade georreferenciada no mapa, desde um incidente (ponto), uma obra (ponto com atributos), um lote de terreno (polígono) ou uma rede de água (polilinha). Esta abordagem permite uma rápida expansão para novas categorias de dados urbanos.</p>
                                    <p>A integração de Inteligência Artificial é realizada através do framework Google Genkit, que orquestra modelos de linguagem (Gemini) para executar tarefas como análise de conformidade de projetos, deteção de duplicados, cálculo de prioridades e geração de sumários executivos para painéis de gestão.</p>
                                </section>
                                
                                <section>
                                    <h2 className="font-semibold text-lg">3. Módulos e Funcionalidades Chave</h2>
                                     <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Fiscalização Cívica e Gestão de Incidentes:</strong> Cidadãos podem reportar incidentes georreferenciados (buracos, falhas de iluminação, etc.). A IA calcula a prioridade, e o sistema encaminha para o painel de gestão municipal para despacho de equipas de campo.</li>
                                        <li><strong>Processos Urbanos e Licenciamento Digital:</strong> Um fluxo completo para o licenciamento de obras, desde a seleção de um lote de terreno (com regras de zoneamento visíveis), submissão de projeto, análise de conformidade por IA, e gestão interativa do fluxo de aprovação por parte dos técnicos municipais.</li>
                                        <li><strong>Marketplace Imobiliário Transparente:</strong> Um portal para a compra e venda de lotes de terreno e imóveis, integrado com o "Painel de Confiança MUNITU", que agrega o estado de verificação legal (realizado pela administração) e o estado fiscal da propriedade, aumentando a segurança jurídica das transações.</li>
                                        <li><strong>Gestão de Croquis e Localização:</strong> Ferramentas para cidadãos e empresas criarem e partilharem croquis de localização detalhados, com pontos de referência, rotas e polígonos de área, facilitando a logística e as entregas.</li>
                                    </ul>
                                </section>

                                 <section>
                                    <h2 className="font-semibold text-lg">4. Análise de Impacto e Conclusão</h2>
                                    <p>A implementação da MUNITU tem o potencial de gerar um impacto multifacetado. Para o cidadão, reduz a fricção no acesso a serviços e transforma-o num agente ativo na melhoria do seu ambiente. Para a administração municipal, oferece uma visão 360º e em tempo real do território, automatiza tarefas de análise e otimiza a alocação de recursos. Para o setor privado, nomeadamente o imobiliário e da construção, a plataforma aumenta a transparência e a segurança, podendo acelerar o investimento.</p>
                                    <p>Concluímos que a MUNITU representa um paradigma viável para a modernização da governação urbana. Ao colocar um mapa inteligente e colaborativo no centro da interação cívica, a plataforma cria um ciclo virtuoso de recolha de dados, ação informada e feedback transparente.</p>
                                </section>
                                
                                <section>
                                    <h2 className="font-semibold text-lg">5. Trabalhos Futuros</h2>
                                    <p>Os próximos passos no desenvolvimento da MUNITU incluem a expansão dos módulos para cobrir a gestão de recursos hídricos e o uso do solo a nível nacional. Pretende-se também aprofundar as capacidades de análise preditiva da IA para antecipar problemas urbanos, como o risco de cheias ou a degradação de infraestruturas, passando de um modelo reativo para um proativo.</p>
                                </section>
                            </CardContent>
                        </Card>
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
