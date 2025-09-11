
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Check, Clipboard, ExternalLink, Mail, Phone, User, X } from "lucide-react";
import { useInstitutionalRequests } from "@/services/request-service";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

function InstitutionalRequestsPage() {
    const { requests, loading, updateRequestStatus } = useInstitutionalRequests();

    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40 p-6 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const processedRequests = requests.filter(r => r.status !== 'pending');

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Solicitações Institucionais
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Solicitações Pendentes</CardTitle>
                        <CardDescription>
                           Novas solicitações de registo de entidades para revisão e aprovação.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pendingRequests.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {pendingRequests.map(req => (
                                    <AccordionItem key={req.id} value={req.id!}>
                                        <AccordionTrigger>
                                            <div className="flex flex-col items-start text-left">
                                                <p className="font-semibold">{req.entityName}</p>
                                                <p className="text-sm text-muted-foreground">{req.entityType}</p>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <div className="text-sm space-y-2 p-3 bg-muted/50 rounded-md">
                                                <p><strong className="text-muted-foreground">NIF:</strong> {req.nif}</p>
                                                <p><strong className="text-muted-foreground">Endereço:</strong> {req.address}</p>
                                                <p><strong className="text-muted-foreground">Província:</strong> {req.province}, {req.municipality}</p>
                                                <p><strong className="text-muted-foreground">Solicitado em:</strong> {format(new Date(req.createdAt), "dd MMM, yyyy 'às' HH:mm", {locale: pt})}</p>
                                            </div>
                                            <div className="text-sm space-y-2 p-3 bg-muted/50 rounded-md">
                                                <p className="font-semibold text-xs uppercase text-muted-foreground">Ponto de Contacto</p>
                                                <p><strong className="text-muted-foreground">Nome:</strong> {req.contactName} ({req.contactRole})</p>
                                                <p className="flex items-center gap-2"><Mail className="h-3 w-3"/> <a href={`mailto:${req.contactEmail}`} className="text-primary hover:underline">{req.contactEmail}</a></p>
                                                <p className="flex items-center gap-2"><Phone className="h-3 w-3"/> <a href={`tel:${req.contactPhone}`} className="text-primary hover:underline">{req.contactPhone}</a></p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={req.verificationDocumentUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="mr-2 h-4 w-4"/>Ver Documento
                                                    </a>
                                                </Button>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="destructive" onClick={() => updateRequestStatus(req.id!, 'rejected')}> <X className="mr-2 h-4 w-4"/> Rejeitar</Button>
                                                    <Button size="sm" onClick={() => updateRequestStatus(req.id!, 'approved')}> <Check className="mr-2 h-4 w-4"/> Aprovar</Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                             </Accordion>
                        ) : (
                             <div className="text-center py-12">
                                <Clipboard className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">Sem solicitações pendentes</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Novas solicitações de entidades aparecerão aqui.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Solicitações</CardTitle>
                        <CardDescription>
                           Solicitações que já foram aprovadas ou rejeitadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {processedRequests.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {processedRequests.map(req => (
                                    <AccordionItem key={req.id} value={req.id!}>
                                        <AccordionTrigger>
                                            <div className="flex flex-col items-start text-left">
                                                <p className="font-semibold">{req.entityName}</p>
                                                <p className={`text-sm font-medium ${req.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{req.status === 'approved' ? 'Aprovado' : 'Rejeitado'}</p>
                                            </div>
                                        </AccordionTrigger>
                                         <AccordionContent className="space-y-4">
                                            <p className="text-sm"><strong className="text-muted-foreground">Email de Contacto:</strong> {req.contactEmail}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                             </Accordion>
                         ) : (
                              <div className="text-center py-12">
                                <Clipboard className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">Nenhum histórico</h3>
                                <p className="mt-1 text-sm text-muted-foreground">As solicitações processadas aparecerão aqui.</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(InstitutionalRequestsPage, ['Administrador']);
