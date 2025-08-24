
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Plus, Share2 } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const CroquiCard = ({ croqui, onShare }: { croqui: PointOfInterest, onShare: (id: string, title: string) => void }) => {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Share2 className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{croqui.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Criado em: {new Date(croqui.lastReported!).toLocaleDateString('pt-PT')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/croquis/${croqui.id}`} target="_blank">Ver</Link>
                    </Button>
                    <Button variant="default" size="sm" onClick={() => onShare(croqui.id, croqui.title || 'Croqui')}>
                        Partilhar
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function MeusCroquisPage() {
    const { user } = useAuth();
    const { allData, loading } = usePoints();
    const router = useRouter();
    const { toast } = useToast();

    const userCroquis = React.useMemo(() => {
        if (!user) return [];
        return allData.filter(p => p.type === 'croqui' && p.authorId === user.uid);
    }, [allData, user]);

    const handleShare = (id: string, title: string) => {
        const shareUrl = `${window.location.origin}/croquis/${id}`;
        if (navigator.share) {
            navigator.share({
                title: `Croqui de Localização: ${title}`,
                text: `Veja como chegar a "${title}" através deste croqui da MUNITU.`,
                url: shareUrl,
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({ title: "Link do Croqui Copiado!", description: "Pode agora colá-lo em qualquer aplicação de mensagens." });
        }
    };
    
    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">A carregar os seus croquis...</div>;
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
                    Meus Croquis
                </h1>
                 <div className="ml-auto">
                     <Button onClick={() => router.push('/?#report-croqui')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Novo Croqui
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
                {userCroquis.length > 0 ? (
                     <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Os Meus Croquis de Localização</CardTitle>
                                <CardDescription>Gira, partilhe e visualize todos os seus croquis guardados.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {userCroquis.map(c => <CroquiCard key={c.id} croqui={c} onShare={handleShare} />)}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Share2 className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-2xl font-bold tracking-tight">Ainda não criou nenhum croqui</h3>
                            <p className="text-muted-foreground">Crie um croqui para partilhar facilmente a localização da sua casa ou de um evento.</p>
                            <Button className="mt-4" onClick={() => router.push('/?#report-croqui')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Novo Croqui
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(MeusCroquisPage);
