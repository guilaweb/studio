
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Home, Plus, ShieldCheck, Shield, ShieldAlert, HelpCircle } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestStatus, statusLabelMap } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


export const VerificationSeal = ({ status }: { status: PointOfInterestStatus }) => {
    const sealConfig = {
        verificado_ouro: {
            Icon: ShieldCheck,
            label: "Verificado (Ouro)",
            description: "Propriedade validada com documentos oficiais e sem conflitos geo-espaciais.",
            className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300",
        },
        verificado_prata: {
            Icon: Shield,
            label: "Verificado (Prata)",
            description: "Posse confirmada com base em documentos históricos e/ou validação comunitária.",
             className: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:border-slate-700 dark:text-slate-300",
        },
        em_verificacao: {
            Icon: ShieldAlert,
            label: "Em Verificação",
            description: "Este imóvel está a ser analisado pelos nossos técnicos.",
            className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
        },
        informacao_insuficiente: {
            Icon: HelpCircle,
            label: "Info Insuficiente",
            description: "A verificação falhou. Por favor, verifique as comunicações e forneça os dados pedidos.",
             className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300",
        },
        Privado: {
            Icon: HelpCircle,
            label: "Privado",
            description: "Este imóvel é privado e não foi submetido para verificação.",
            className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-300",
        },
        default: {
            Icon: HelpCircle,
            label: statusLabelMap[status] || "Privado",
            description: "O estado atual deste imóvel é privado ou não verificado.",
            className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-300",
        }
    };

    const config = sealConfig[status as keyof typeof sealConfig] || sealConfig.default;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Badge variant="outline" className={`gap-1.5 font-semibold ${config.className}`}>
                        <config.Icon className="h-3.5 w-3.5" />
                        {config.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};


const PropertyCard = ({ property }: { property: PointOfInterest }) => {
    // A foto principal seria a primeira foto nas 'updates', se existir
    const mainPhoto = property.updates?.find(u => u.photoDataUri)?.photoDataUri;
    const placeholderImage = "https://placehold.co/600x400.png";

    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-0">
                <div className="relative h-40 w-full">
                    <Image
                        src={mainPhoto || placeholderImage}
                        alt={`Imagem de ${property.title}`}
                        fill={true}
                        style={{objectFit: 'cover'}}
                        data-ai-hint="house exterior"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <CardTitle className="text-lg mb-1">{property.title}</CardTitle>
                <CardDescription>
                    Registo: {property.registrationCode || "Não especificado"}
                </CardDescription>
                <div className="mt-4 flex justify-between items-center">
                    <VerificationSeal status={property.status || 'Privado'} />
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/meus-imoveis/${property.id}`}>Gerir</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


function MeusImoveisPage() {
    const { user } = useAuth();
    const { allData, loading } = usePoints();

    const userProperties = React.useMemo(() => {
        if (!user) return [];
        // This logic will be expanded to include properties owned by the user, not just authored.
        // For now, authorId is a good proxy.
        return allData.filter(p => p.type === 'land_plot' && p.authorId === user.uid);
    }, [allData, user]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">A carregar os seus imóveis...</div>;
    }

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
                    Meus Imóveis MUNITU
                </h1>
                <div className="ml-auto">
                     <Button asChild>
                        <Link href="/meus-imoveis/novo">
                            <Plus className="mr-2 h-4 w-4" />
                            Registar Novo Imóvel
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                {userProperties.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {userProperties.map(prop => (
                            <PropertyCard key={prop.id} property={prop} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Home className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-2xl font-bold tracking-tight">Ainda não tem imóveis registados</h3>
                            <p className="text-muted-foreground">Comece por registar o seu primeiro terreno, casa ou quinta.</p>
                            <Button className="mt-4" asChild>
                                <Link href="/meus-imoveis/novo">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Registar Imóvel
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(MeusImoveisPage);
