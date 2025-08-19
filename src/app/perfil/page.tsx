
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Award, Building, FileText, Home, Inbox, User as UserIcon } from "lucide-react";
import { medals } from "@/lib/medals";

function PerfilPage() {
    const { user, profile } = useAuth();
    const { allData } = usePoints();

    const userContributions = React.useMemo(() => {
        if (!user) return [];
        return allData.filter(point => point.authorId === user.uid);
    }, [allData, user]);

    const userPoints = userContributions.length * 10; // Simple point system: 10 points per contribution

    const earnedMedals = React.useMemo(() => {
        return medals.filter(medal => medal.isAchieved(userContributions));
    }, [userContributions]);


    if (!user || !profile) {
        return null; // The withAuth HOC handles redirection
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
                    Meu Perfil MUNITU
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 md:gap-8">
                <div className="md:col-span-2 grid auto-rows-max items-start gap-4 md:gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>As Minhas Estatísticas</CardTitle>
                            <CardDescription>
                                A sua contribuição para uma cidade melhor. Cada ação conta!
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
                                <h4 className="font-semibold">As minhas medalhas</h4>
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
                                        <p className="text-sm">Faça a sua primeira contribuição para ganhar a sua primeira medalha. Continue a contribuir para desbloquear novas conquistas!</p>
                                    </div>
                                )}
                           </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid auto-rows-max items-start gap-4 md:gap-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                             <Avatar className="h-16 w-16">
                                <AvatarImage src={user.photoURL || undefined} alt={profile.displayName || user.email || "User"} />
                                <AvatarFallback>{(profile.displayName || user.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <CardTitle className="text-xl">{profile.displayName}</CardTitle>
                                <CardDescription>{profile.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <p className="text-xs text-muted-foreground">Membro desde: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-PT') : 'N/A'}</p>
                             <Button variant="outline" size="sm" className="mt-4 w-full">Editar Perfil</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Atalhos Rápidos</CardTitle>
                            <CardDescription>Aceda aos seus principais módulos.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button variant="ghost" className="justify-start gap-2" asChild>
                                <Link href="/meus-imoveis"><Home /> Meus Imóveis</Link>
                            </Button>
                             <Button variant="ghost" className="justify-start gap-2" asChild>
                                <Link href="/licencas"><FileText /> Minhas Licenças</Link>
                            </Button>
                             <Button variant="ghost" className="justify-start gap-2" asChild>
                                <Link href="/marketplace"><Building /> Marketplace</Link>
                            </Button>
                             <Button variant="ghost" className="justify-start gap-2" asChild>
                                <Link href="/inbox"><Inbox /> Caixa de Entrada</Link>
                            </Button>
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </div>
    );
}

export default withAuth(PerfilPage);
