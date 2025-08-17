
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Lightbulb, MapPin, Search, CheckCircle, Briefcase, FileCheck, RefreshCw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
            </main>
        </div>
    );
}
