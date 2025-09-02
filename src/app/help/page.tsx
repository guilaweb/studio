
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Lightbulb, MapPin, Search, CheckCircle, Briefcase, FileCheck, RefreshCw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

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

export default function HelpPage() {
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
                        mapId={'help-map'}
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
                            Ajuda & FAQ
                        </h1>
                    </header>
                    <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Perguntas Frequentes</CardTitle>
                                <CardDescription>
                                    Encontre aqui respostas para as dúvidas mais comuns sobre a utilização da plataforma MUNITU.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>Como posso reportar um incidente?</AccordionTrigger>
                                        <AccordionContent>
                                            É muito simples! Clique no botão "Nova Contribuição" no menu lateral (ou no botão flutuante no telemóvel), selecione o tipo de incidente que quer reportar (ex: "Reportar Incidente", "Buraco na Via"), ajuste a localização no mapa, preencha os detalhes e submeta. A sua contribuição será enviada diretamente para as equipas municipais.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger>O que acontece depois de eu reportar um incidente?</AccordionTrigger>
                                        <AccordionContent>
                                            Após a submissão, o seu reporte aparece no mapa e entra no sistema de gestão municipal. Pode acompanhar o estado do seu reporte no seu perfil. Receberá notificações sempre que o estado for atualizado pelas equipas no terreno (ex: de "Submetido" para "Em Análise" e depois para "Resolvido").
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger>Posso editar um reporte que já fiz?</AccordionTrigger>
                                        <AccordionContent>
                                            Sim. Se for o autor de um reporte de incidente ou de um ATM, pode editá-lo. Basta clicar no marcador correspondente no mapa para abrir o painel de detalhes e encontrará um botão "Editar". Note que outros tipos de contribuições, como comentários, não podem ser editados.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-4">
                                        <AccordionTrigger>O que são as camadas no menu lateral?</AccordionTrigger>
                                        <AccordionContent>
                                            As camadas permitem-lhe controlar a informação que vê no mapa. Pode ligar ou desligar a visualização de diferentes tipos de pontos de interesse, como "Incidentes", "Obras" ou "Lotes de Terreno", para focar apenas na informação que lhe interessa no momento.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-5">
                                        <AccordionTrigger>Como funciona o sistema de medalhas e pontos?</AccordionTrigger>
                                        <AccordionContent>
                                            É a nossa forma de agradecer e reconhecer a sua participação! Por cada contribuição que faz (reportes, comentários, etc.), ganha pontos. Ao acumular pontos e ao realizar tipos específicos de contribuições, desbloqueia medalhas que ficam visíveis no seu perfil. É uma forma divertida de ver o seu impacto positivo na cidade!
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-6">
                                        <AccordionTrigger>Os meus dados pessoais estão seguros?</AccordionTrigger>
                                        <AccordionContent>
                                            Absolutamente. A sua privacidade e a segurança dos seus dados são a nossa máxima prioridade. A plataforma segue as melhores práticas de segurança e cumpre a legislação de proteção de dados. O seu nome de utilizador pode ser visível nalgumas contribuições para promover a transparência, mas os seus outros dados pessoais nunca são partilhados publicamente.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Exemplo de Uso: A Jornada com a MUNITU</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">O Problema</h4>
                                    <p className="text-muted-foreground">O Sr. Mateus, um cidadão, vê que a rua principal do seu bairro está perigosamente escura. Ele pega no telemóvel e abre a app MUNITU. Com alguns cliques no módulo de Iluminação Pública, ele reporta os candeeiros avariados.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">A Ação</h4>
                                    <p className="text-muted-foreground">No Painel Municipal da MUNITU, a chefe do departamento de manutenção vê os novos reportes. Ela atribui uma ordem de serviço à equipa de eletricistas.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">A Resolução</h4>
                                    <p className="text-muted-foreground">A equipa repara os candeeiros e marca a tarefa como "Resolvida" na sua app de campo. O Sr. Mateus recebe uma notificação: "MUNITU informa: O problema de iluminação que reportou foi resolvido. Obrigado por fazer a sua parte!"</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">O Investimento</h4>
                                    <p className="text-muted-foreground">Uma construtora, ao analisar os dados do MUNITU, percebe que o bairro está a melhorar. Eles usam o módulo PGUL da MUNITU para encontrar um lote disponível para construir um novo edifício.</p>
                                </div>
                                 <div>
                                    <h4 className="font-semibold">O Licenciamento</h4>
                                    <p className="text-muted-foreground">O arquiteto submete todo o projeto através da MUNITU. Ele acompanha cada passo do processo, comunica com os técnicos e paga as taxas diretamente na plataforma.</p>
                                </div>
                                 <div>
                                    <h4 className="font-semibold">O Ciclo Completo</h4>
                                    <p className="text-muted-foreground">A licença é emitida digitalmente. A nova obra aparece no mapa público, e os vizinhos podem verificar a sua legalidade e acompanhar o seu progresso, tudo dentro do ecossistema MUNITU.</p>
                                </div>
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
