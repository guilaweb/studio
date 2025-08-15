
"use client";

import * as React from "react";
import { usePoints } from "@/hooks/use-points";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Award, Shield, Star, Trash2, Siren } from "lucide-react";
import { PointOfInterest } from "@/lib/data";

// This component can be expanded to fetch user data from a database
// For now, we'll derive what we can from the points data.
const getMockUserData = (userId: string, allData: PointOfInterest[]) => {
    const userContributions = allData.filter(p => p.authorId === userId);
    if (userContributions.length === 0) return null;

    // In a real app, this data would come from a user profile service.
    // We are mocking it for demonstration.
    // We can try to get the real display name from one of the updates if available
    const latestUpdate = userContributions.flatMap(p => p.updates || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    return {
        uid: userId,
        displayName: latestUpdate?.authorId || `Cidadão ${userId.substring(0, 5)}`,
        photoURL: `https://i.pravatar.cc/150?u=${userId}`,
        email: `cidadão_${userId.substring(0,5)}@email.com`,
        metadata: {
            creationTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Mock: 30 days ago
        }
    };
}


type Medal = {
    name: string;
    description: string;
    Icon: React.ElementType;
    colorClasses: {
      bg: string;
      border: string;
      icon: string;
      title: string;
      text: string;
    };
    isAchieved: (contributions: PointOfInterest[]) => boolean;
};

const medals: Medal[] = [
    {
        name: "Fiscal Iniciante",
        description: "Concedida pela sua primeira contribuição. Bem-vindo!",
        Icon: Award,
        colorClasses: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            icon: 'text-yellow-500',
            title: 'text-yellow-800 dark:text-yellow-300',
            text: 'text-yellow-700 dark:text-yellow-400',
        },
        isAchieved: (contributions) => contributions.length >= 1,
    },
    {
        name: "Fiscal Atento",
        description: "Dez contribuições! Os seus olhos estão a fazer a diferença.",
        Icon: Star,
        colorClasses: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            icon: 'text-blue-500',
            title: 'text-blue-800 dark:text-blue-300',
            text: 'text-blue-700 dark:text-blue-400',
        },
        isAchieved: (contributions) => contributions.length >= 10,
    },
    {
        name: "Guardião da Cidade",
        description: "Vinte e cinco contribuições! Você é um pilar da comunidade.",
        Icon: Shield,
        colorClasses: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            icon: 'text-green-500',
            title: 'text-green-800 dark:text-green-300',
            text: 'text-green-700 dark:text-green-400',
        },
        isAchieved: (contributions) => contributions.length >= 25,
    },
        {
        name: "Vigilante do Saneamento",
        description: "Reportou 5 pontos de saneamento. A sua ajuda mantém a cidade limpa!",
        Icon: Trash2,
        colorClasses: {
            bg: 'bg-cyan-50 dark:bg-cyan-900/20',
            border: 'border-cyan-200 dark:border-cyan-800',
            icon: 'text-cyan-500',
            title: 'text-cyan-800 dark:text-cyan-300',
            text: 'text-cyan-700 dark:text-cyan-400',
        },
        isAchieved: (contributions) => contributions.filter(c => c.type === 'sanitation').length >= 5,
    },
    {
        name: "Sentinela de Incidentes",
        description: "Reportou 5 incidentes. A sua prontidão ajuda a manter todos seguros.",
        Icon: Siren,
        colorClasses: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            icon: 'text-red-500',
            title: 'text-red-800 dark:text-red-300',
            text: 'text-red-700 dark:text-red-400',
        },
        isAchieved: (contributions) => contributions.filter(c => c.type === 'incident').length >= 5,
    },
];


function PublicProfilePage({ params }: { params: { userId: string } }) {
    const { allData } = usePoints();
    const { userId } = params;

    const user = getMockUserData(userId, allData);

    const userContributions = React.useMemo(() => {
        if (!user) return [];
        return allData.filter(point => point.authorId === user.uid);
    }, [allData, user]);

    const userPoints = userContributions.length * 10;

    const earnedMedals = React.useMemo(() => {
        return medals.filter(medal => medal.isAchieved(userContributions));
    }, [userContributions]);


    if (!user) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Utilizador não encontrado</CardTitle>
                        <CardDescription>
                            Não foi possível encontrar um utilizador com o ID fornecido ou este utilizador ainda não fez contribuições.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Voltar ao Painel
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
             </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar ao Painel</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Perfil Público do Cidadão
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Cidadão</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                                    <AvatarFallback>{(user.displayName || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-lg font-semibold">{user.displayName}</p>
                                    <p className="text-xs text-muted-foreground">Membro desde: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-PT') : 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Estatísticas de Contribuição</CardTitle>
                            <CardDescription>
                                O impacto deste cidadão na melhoria da cidade.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div className="flex items-center justify-around rounded-lg bg-muted p-4 text-center">
                                <div>
                                    <p className="text-3xl font-bold">{userContributions.length}</p>
                                    <p className="text-sm text-muted-foreground">Contribuições</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{userPoints}</p>
                                    <p className="text-sm text-muted-foreground">Pontos</p>
                                </div>
                           </div>
                           <div className="space-y-4">
                                <h4 className="font-semibold">Medalhas Conquistadas</h4>
                                {earnedMedals.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {earnedMedals.map((medal) => (
                                            <div key={medal.name} className={`flex items-start gap-4 p-4 rounded-lg border ${medal.colorClasses.bg} ${medal.colorClasses.border}`}>
                                                <medal.Icon className={`h-8 w-8 shrink-0 ${medal.colorClasses.icon}`}/>
                                                <div>
                                                    <h5 className={`font-semibold ${medal.colorClasses.title}`}>{medal.name}</h5>
                                                    <p className={`text-sm ${medal.colorClasses.text}`}>{medal.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-muted-foreground p-4 rounded-lg border border-dashed">
                                        <Award className="h-8 w-8 text-slate-400"/>
                                        <p className="text-sm">Este utilizador ainda não tem medalhas.</p>
                                    </div>
                                )}
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default PublicProfilePage;
