
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

                 <Card>
                    <CardHeader>
                        <CardTitle>Exemplo de Uso: A Jornada com a MUNITU</CardTitle>
                        <CardDescription>
                            Veja como um simples reporte pode desencadear um ciclo de melhoria e investimento na cidade.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                <Lightbulb className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">O Problema</h3>
                                <p className="text-muted-foreground">O Sr. Mateus, um cidadão, vê que a rua principal do seu bairro está perigosamente escura. Ele pega no telemóvel e abre a app MUNITU. Com alguns cliques no módulo de Iluminação Pública, ele reporta os candeeiros avariados.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">A Ação e a Resolução</h3>
                                <p className="text-muted-foreground">No Painel Municipal da MUNITU, a chefe do departamento de manutenção vê os novos reportes e atribui uma ordem de serviço. A equipa repara os candeeiros e marca a tarefa como "Resolvida". O Sr. Mateus recebe uma notificação: "MUNITU informa: O problema de iluminação que reportou foi resolvido. Obrigado por fazer a sua parte!"</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                <Briefcase className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">O Investimento</h3>
                                <p className="text-muted-foreground">Uma construtora, ao analisar os dados do MUNITU, percebe que o bairro está a melhorar. Eles usam o módulo de licenciamento para encontrar um lote disponível para construir um novo edifício.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                                <FileCheck className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">O Licenciamento</h3>
                                <p className="text-muted-foreground">O arquiteto submete todo o projeto através da MUNITU. Ele acompanha cada passo do processo, comunica com os técnicos e paga as taxas diretamente na plataforma.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                <RefreshCw className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">O Ciclo Completo</h3>
                                <p className="text-muted-foreground">A licença é emitida digitalmente. A nova obra aparece no mapa público, e os vizinhos podem verificar a sua legalidade e acompanhar o seu progresso, tudo dentro do ecossistema MUNITU.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
