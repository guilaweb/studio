
"use client";

import * as React from "react";
import { usePoints } from "@/hooks/use-points";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Award, Landmark, Construction, Siren, Trash, Droplet, Square, Megaphone, Droplets, Share2 } from "lucide-react";
import { useUserProfile } from "@/services/user-service";
import { medals } from "@/lib/medals";
import { useParams, useRouter } from "next/navigation";
import { PointOfInterest, typeLabelMap } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

const layerIcons: { [key in PointOfInterest['type']]: React.ElementType } = {
  atm: Landmark,
  construction: Construction,
  incident: Siren,
  sanitation: Trash,
  water: Droplet,
  land_plot: Square,
  announcement: Megaphone,
  water_resource: Droplets,
  croqui: Share2,
};


function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;
    const { allData } = usePoints();
    const { user, loading } = useUserProfile(userId);
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const userContributions = React.useMemo(() => {
        if (!user) return [];
        return allData.filter(point => point && point.authorId === user.uid)
            .sort((a, b) => new Date(b.lastReported!).getTime() - new Date(a.lastReported!).getTime());
    }, [allData, user]);

    const userPoints = userContributions.length * 10;

    const earnedMedals = React.useMemo(() => {
        const validContributions = userContributions.filter(Boolean);
        return medals.filter(medal => medal.isAchieved(validContributions));
    }, [userContributions]);

    if (loading) {
        return (
             <div className="flex min-h-screen w-full items-center justify-center p-4">
                 A carregar perfil...
            </div>
        );
    }


    if (!user) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Utilizador não encontrado</CardTitle>
                        <CardDescription>
                            Não foi possível encontrar um utilizador com o ID fornecido.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Voltar
                        </Button>
                    </CardContent>
                </Card>
             </div>
        );
    }
    
    const recentContributions = userContributions.slice(0, 5);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Voltar</span>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Perfil Público do Cidadão
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 md:gap-8">
                <div className="grid auto-rows-max items-start gap-4 md:col-span-2 md:gap-8">
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
                                        <p className="text-sm">Este utilizador ainda não conquistou medalhas.</p>
                                    </div>
                                )}
                           </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Atividade Recente</CardTitle>
                            <CardDescription>As últimas contribuições públicas deste utilizador.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentContributions.length > 0 ? (
                                    recentContributions.map(point => {
                                        const Icon = layerIcons[point.type] || Award;
                                        return (
                                            <div key={point.id} className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        Reportou um(a) {typeLabelMap[point.type] || 'item'}:
                                                    </p>
                                                    <Link href={`/?poi=${point.id}`} className="font-semibold text-sm hover:underline">
                                                        {point.title}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {isClient && point.lastReported ? formatDistanceToNow(new Date(point.lastReported), { addSuffix: true, locale: pt }) : '...'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Nenhuma atividade recente para mostrar.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid auto-rows-max items-start gap-4 md:gap-8">
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
                                     <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">Membro desde: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default PublicProfilePage;
