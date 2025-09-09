
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestUpdate } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Check, Eye, Star, Pencil, Tag, PauseCircle, Archive, Share2, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { VerificationSeal } from "@/components/marketplace/verification-seal";
import { Separator } from "@/components/ui/separator";

const getStatusIcon = (update: PointOfInterestUpdate, isFirst: boolean) => {
    if (isFirst) {
        return <Pencil className="h-4 w-4 text-muted-foreground" />;
    }
    if (update.text?.startsWith('**PARECER TÉCNICO**')) {
        return <Check className="h-4 w-4 text-green-500" />;
    }
    return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
}

const Timeline = ({ updates }: { updates: PointOfInterestUpdate[] }) => {
     if (!updates || updates.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Sem atualizações ou comunicações registadas.</p>
    }
    
    const sortedUpdates = [...updates].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border before:-translate-x-px">
            {sortedUpdates.map((update, index) => (
                <div key={update.id} className="relative flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background z-10">
                        {getStatusIcon(update, index === 0)}
                    </div>
                    <div className="flex-1 pt-1">
                        <p className="font-semibold text-sm whitespace-pre-wrap">{update.text}</p>
                        <p className="text-xs text-muted-foreground">
                            Por {update.authorDisplayName || 'Sistema'} • {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true, locale: pt })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}


function ManagePropertyPage() {
    const params = useParams();
    const router = useRouter();
    const propertyId = params.id as string;
    const { allData, loading } = usePoints();
    const [property, setProperty] = React.useState<PointOfInterest | null>(null);

    React.useEffect(() => {
        if (allData.length > 0) {
            const foundProperty = allData.find(p => p.id === propertyId);
            setProperty(foundProperty || null);
        }
    }, [allData, propertyId]);

    const handleCreateCroqui = () => {
        if (!property) return;
        sessionStorage.setItem('poiForCroqui', JSON.stringify(property));
        router.push('/?#report-croqui');
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">A carregar dados do imóvel...</div>;
    }

    if (!property) {
        return <div className="flex min-h-screen items-center justify-center">Imóvel não encontrado.</div>;
    }
    
    const mainPhoto = property.files?.find(f => f.url.match(/\.(jpeg|jpg|gif|png|webp)$/i))?.url || property.updates?.find(u => u.photoDataUri)?.photoDataUri;
    const placeholderImage = "https://placehold.co/600x400.png";

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/meus-imoveis">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight">{property.title}</h1>
                    <p className="text-sm text-muted-foreground">ID do Imóvel: {property.id}</p>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                 <div className="grid auto-rows-max items-start gap-4 md:col-span-2 lg:col-span-3">
                     <Card>
                        <CardHeader>
                            <CardTitle>Linha do Tempo da Verificação</CardTitle>
                            <CardDescription>
                                Histórico completo de todas as comunicações e pareceres dos técnicos sobre o seu processo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Timeline updates={property.updates || []} />
                        </CardContent>
                    </Card>
                 </div>
                 <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                    <Card>
                        <CardContent className="p-0">
                           <div className="relative h-48 w-full">
                                <Image
                                    src={mainPhoto || placeholderImage}
                                    alt={`Imagem de ${property.title}`}
                                    fill={true}
                                    style={{objectFit: 'cover'}}
                                    data-ai-hint="house exterior"
                                    className="rounded-t-lg"
                                />
                            </div>
                        </CardContent>
                        <CardHeader>
                            <CardTitle>{property.title}</CardTitle>
                            <VerificationSeal status={property.status || 'Privado'} />
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão do Imóvel</CardTitle>
                            <CardDescription>Ações disponíveis para este imóvel.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <Button><Tag className="mr-2 h-4 w-4" /> Colocar à Venda</Button>
                             <Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Editar Informações</Button>
                            {property.croquiId ? (
                                <Button variant="outline" asChild>
                                    <Link href={`/croquis/${property.croquiId}`} target="_blank">
                                        <Share2 className="mr-2 h-4 w-4" /> Ver Croqui de Acesso
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="secondary" onClick={handleCreateCroqui}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Criar Croqui de Acesso
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Estatísticas do Anúncio</CardTitle>
                            <CardDescription>Performance do seu imóvel no marketplace.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>Visualizações</span>
                                </div>
                                <span className="font-semibold">0</span>
                            </div>
                             <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Contactos</span>
                                </div>
                                <span className="font-semibold">0</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Star className="h-4 w-4" />
                                    <span>Favoritos</span>
                                </div>
                                <span className="font-semibold">0</span>
                            </div>
                             <Separator className="my-4" />
                             <Button variant="outline" className="w-full" disabled><PauseCircle className="mr-2 h-4 w-4" /> Pausar Anúncio</Button>
                             <Button variant="destructive" className="w-full" disabled><Archive className="mr-2 h-4 w-4" /> Marcar como Vendido</Button>
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </div>
    );
}

export default withAuth(ManagePropertyPage);
