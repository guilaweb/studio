
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Award } from "lucide-react";

function PerfilPage() {
    const { user } = useAuth();
    const { allData } = usePoints();

    const userContributions = React.useMemo(() => {
        if (!user) return [];
        return allData.filter(point => point.authorId === user.uid);
    }, [allData, user]);

    const userPoints = userContributions.length * 10; // Simple point system: 10 points per contribution

    if (!user) {
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
                    Meu Perfil de Fiscal Cidadão
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Conta</CardTitle>
                            <CardDescription>
                                Os seus dados pessoais e de contacto.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                                    <AvatarFallback>{(user.displayName || user.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-lg font-semibold">{user.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">Membro desde: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-PT') : 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                           <div className="space-y-2">
                                <h4 className="font-semibold">As minhas medalhas</h4>
                                {userContributions.length > 0 ? (
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                        <Award className="h-8 w-8 text-yellow-500"/>
                                        <div>
                                            <h5 className="font-semibold text-yellow-800">Fiscal Iniciante</h5>
                                            <p className="text-sm text-yellow-700">Parabéns pela sua primeira contribuição! Continue assim.</p>
                                        </div>
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
            </main>
        </div>
    );
}

export default withAuth(PerfilPage);
