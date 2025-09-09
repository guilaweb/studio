

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestUpdate, QueueTime, statusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Clock, ThumbsDown, ThumbsUp, User, Wand2, XCircle, Fuel, BellRing, Gauge, Wind } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import FuelAvailabilityReport from "@/components/fuel-availability-report";

const StatusHeader = ({ poi, onStatusChange }: { poi: PointOfInterest, onStatusChange: (status: 'available' | 'unavailable', fuels?: string[], queueTime?: QueueTime) => void }) => {
    const { user } = useAuth();
    const isAvailable = poi.status === 'available';
    const lastUpdate = poi.updates && poi.updates.length > 0 ? poi.updates[0] : null;
    const [reportOpen, setReportOpen] = React.useState(false);

    const handleAvailableClick = () => {
        setReportOpen(true);
    };
    
    const handleConfirm = (fuels: string[], queueTime?: QueueTime) => {
        onStatusChange('available', fuels, queueTime);
    };

    const handleUnavailableClick = () => {
        onStatusChange('unavailable', [], undefined);
    };

    const handleNotifyClick = () => {
        // Placeholder for a real notification system
        alert("Funcionalidade de notificação em desenvolvimento. Será notificado quando houver combustível.");
    };

    return (
        <>
            <Card className={isAvailable ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700" : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700"}>
                <CardHeader>
                    <CardTitle className={isAvailable ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                        {isAvailable ? "Provavelmente Tem Combustível" : "Provavelmente Não Tem Combustível"}
                    </CardTitle>
                    <CardDescription className={isAvailable ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                        {lastUpdate ? `Última confirmação há ${formatDistanceToNow(new Date(lastUpdate.timestamp), { locale: pt })} por ${lastUpdate.authorDisplayName}` : 'Sem reportes recentes.'}
                    </CardDescription>
                </CardHeader>
                {user && (
                    <CardContent className="flex flex-col sm:flex-row gap-2">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAvailableClick}>
                            <ThumbsUp className="mr-2 h-4 w-4"/> Confirmar que TEM
                        </Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleUnavailableClick}>
                            <ThumbsDown className="mr-2 h-4 w-4" /> Confirmar que NÃO TEM
                        </Button>
                    </CardContent>
                )}
            </Card>
            {poi.status === 'unavailable' && (
                <Button variant="outline" className="w-full mt-2" onClick={handleNotifyClick}>
                    <BellRing className="mr-2 h-4 w-4" /> Avise-me Quando Tiver Combustível
                </Button>
            )}
            <FuelAvailabilityReport
                open={reportOpen}
                onOpenChange={setReportOpen}
                onConfirm={handleConfirm}
            />
        </>
    );
};

const Timeline = ({ updates }: { updates: PointOfInterestUpdate[] }) => {
    if (!updates || updates.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Ainda não há histórico de atividade para este Posto.</p>
    }
    
    return (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border before:-translate-x-px md:ml-6">
            {updates.map((update) => {
                const isAvailable = update.text?.includes("Com Combustível");
                const Icon = isAvailable ? CheckCircle : XCircle;
                const iconColor = isAvailable ? "text-green-500" : "text-red-500";
                const bgColor = isAvailable ? "bg-green-50" : "bg-red-50";

                return (
                    <div key={update.id} className="relative flex items-start gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${bgColor} z-10 md:h-12 md:w-12`}>
                           <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />
                        </div>
                        <div className="flex-1 pt-1.5 md:pt-2.5">
                            <p className="font-semibold text-sm md:text-base">
                               {isAvailable ? "Com Combustível" : "Sem Combustível"}
                            </p>
                             {isAvailable && update.availableFuels && update.availableFuels.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Disponível: {update.availableFuels.join(', ')}
                                </p>
                             )}
                            <p className="text-xs text-muted-foreground">
                                Reportado por {update.authorDisplayName} • {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true, locale: pt })}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function FuelStationHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const stationId = params.id as string;
    const { allData, loading, updatePointStatus } = usePoints();
    const [station, setStation] = React.useState<PointOfInterest | null>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        if (allData.length > 0) {
            const foundStation = allData.find(p => p.id === stationId);
            setStation(foundStation || null);
        }
    }, [allData, stationId]);

    const handleStatusChange = (status: 'available' | 'unavailable', fuels?: string[], queueTime?: QueueTime) => {
        if (!station) return;
        const updateText = `Estado atualizado para: ${status === 'available' ? 'Com Combustível' : 'Sem Combustível'}`;
        
        // The availableNotes parameter is repurposed for availableFuels here.
        // This is a bit of a hack but avoids changing the core function signature for now.
        // A better long-term solution would be a more generic update payload.
        updatePointStatus(station.id, status, updateText, undefined, queueTime, fuels);
        
        toast({
            title: "Obrigado pela sua contribuição!",
            description: `O estado do Posto foi atualizado para "${status === 'available' ? 'Com Combustível' : 'Sem Combustível'}".`
        })
    }

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">A carregar detalhes do Posto...</div>;
    }

    if (!station) {
        return <div className="flex min-h-screen items-center justify-center">Posto de Combustível não encontrado.</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Voltar</span>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight">{station.title}</h1>
                    <p className="text-sm text-muted-foreground">Histórico de Disponibilidade</p>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6">
                <StatusHeader poi={station} onStatusChange={handleStatusChange} />
                <Card>
                    <CardHeader>
                        <CardTitle>Linha do Tempo de Reportes</CardTitle>
                        <CardDescription>
                            Histórico de todas as contribuições da comunidade para este Posto de Combustível.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Timeline updates={station.updates || []} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(FuelStationHistoryPage);
