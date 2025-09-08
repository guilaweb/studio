
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { withAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestUpdate, QueueTime, queueTimeLabelMap, statusLabelMap, AnalyzeAtmHistoryOutput } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Clock, ThumbsDown, ThumbsUp, User, Wand2, XCircle, Banknote, HelpCircle, Users, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import AtmNoteReport from "@/components/atm-note-report";
import { analyzeAtmHistoryFlow } from "@/ai/flows/analyze-atm-history-flow";
import { Skeleton } from "@/components/ui/skeleton";

const NoteAnalysis = ({ poi }: { poi: PointOfInterest }) => {
    const { toast } = useToast();
    const [analysis, setAnalysis] = React.useState<AnalyzeAtmHistoryOutput | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalysis = async () => {
            if (!poi.updates || poi.updates.length < 2) {
                 setLoading(false);
                 return;
            }
            setLoading(true);
            try {
                const result = await analyzeAtmHistoryFlow({ updates: poi.updates });
                setAnalysis(result);
            } catch (error) {
                console.error("Failed to fetch ATM analysis:", error);
                 toast({
                    variant: "destructive",
                    title: "Erro de IA",
                    description: "Não foi possível obter a análise do ATM.",
                });
            } finally {
                setLoading(false);
            }
        }
        fetchAnalysis();
    }, [poi, toast]);


    return (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <CardHeader>
                    <div className="flex items-center gap-3">
                    <Wand2 className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-blue-800 dark:text-blue-300">Análise MUNITU (IA)</CardTitle>
                    </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-start gap-3">
                    <Banknote className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Notas Disponíveis (Estimativa)</h4>
                         {loading ? <Skeleton className="h-4 w-48 mt-1" /> : (
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                {analysis?.availableNotesSummary || 'Ainda não há informação sobre as notas disponíveis. Contribua!'}
                            </p>
                        )}
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Padrão de Fila (Estimativa)</h4>
                        {loading ? <Skeleton className="h-4 w-48 mt-1" /> : (
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                {analysis?.queuePatternSummary || 'Ainda não há informação sobre o tempo de fila. Contribua!'}
                            </p>
                        )}
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Padrão de Reabastecimento</h4>
                         {loading ? <Skeleton className="h-4 w-48 mt-1" /> : (
                             <p className="text-sm text-blue-700 dark:text-blue-400">
                                {analysis?.restockPatternSummary || 'Não há dados suficientes para estimar o padrão.'}
                            </p>
                         )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const StatusHeader = ({ poi, onStatusChange }: { poi: PointOfInterest, onStatusChange: (status: 'available' | 'unavailable', notes?: number[], queueTime?: QueueTime) => void }) => {
    const isAvailable = poi.status === 'available';
    const lastUpdate = poi.updates && poi.updates.length > 0 ? poi.updates[0] : null;
    const [noteReportOpen, setNoteReportOpen] = React.useState(false);

    const handleAvailableClick = () => {
        setNoteReportOpen(true);
    };
    
    const handleNoteConfirm = (notes: number[], queueTime?: QueueTime) => {
        onStatusChange('available', notes, queueTime);
    };

    return (
        <>
            <Card className={isAvailable ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700" : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700"}>
                <CardHeader>
                    <CardTitle className={isAvailable ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                        {isAvailable ? "Provavelmente Tem Dinheiro" : "Provavelmente Não Tem Dinheiro"}
                    </CardTitle>
                    <CardDescription className={isAvailable ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                        {lastUpdate ? `Última confirmação há ${formatDistanceToNow(new Date(lastUpdate.timestamp), { locale: pt })} por ${lastUpdate.authorDisplayName}` : 'Sem reportes recentes.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAvailableClick}>
                        <ThumbsUp className="mr-2 h-4 w-4"/> Confirmar que TEM
                    </Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => onStatusChange('unavailable')}>
                        <ThumbsDown className="mr-2 h-4 w-4" /> Confirmar que NÃO TEM
                    </Button>
                </CardContent>
            </Card>
            <AtmNoteReport
                open={noteReportOpen}
                onOpenChange={setNoteReportOpen}
                onConfirm={handleNoteConfirm}
            />
        </>
    );
};


const Timeline = ({ updates }: { updates: PointOfInterestUpdate[] }) => {
    if (!updates || updates.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Ainda não há histórico de atividade para este ATM.</p>
    }
    
    // The updates are already sorted by timestamp descending from the hook
    return (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border before:-translate-x-px md:ml-6">
            {updates.map((update) => {
                const isAvailable = update.text?.includes("Com Dinheiro");
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
                               {isAvailable ? "Com Dinheiro" : "Sem Dinheiro"}
                            </p>
                             {isAvailable && update.availableNotes && update.availableNotes.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Notas reportadas: {update.availableNotes.join(', ')} Kz
                                </p>
                             )}
                             {update.queueTime && (
                                <p className="text-xs text-muted-foreground">
                                    Fila: {queueTimeLabelMap[update.queueTime]}
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

function AtmHistoryPage() {
    const params = useParams();
    const atmId = params.id as string;
    const { allData, loading, addUpdateToPoint, updatePointStatus } = usePoints();
    const [atm, setAtm] = React.useState<PointOfInterest | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    React.useEffect(() => {
        if (allData.length > 0) {
            const foundAtm = allData.find(p => p.id === atmId);
            if(foundAtm) {
                setAtm(foundAtm);
            }
        }
    }, [allData, atmId]);

    const handleStatusChange = (status: 'available' | 'unavailable', notes?: number[], queueTime?: QueueTime) => {
        if (!atm) return;
        const updateText = `Estado atualizado para: ${status === 'available' ? 'Com Dinheiro' : 'Sem Dinheiro'}`;
        updatePointStatus(atm.id, status, updateText, notes, queueTime);
        toast({
            title: "Obrigado pela sua contribuição!",
            description: `O estado do ATM foi atualizado para "${status === 'available' ? 'Com Dinheiro' : 'Sem Dinheiro'}".`
        })
    }


    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">A carregar detalhes do ATM...</div>;
    }

    if (!atm) {
        return <div className="flex min-h-screen items-center justify-center">ATM não encontrado.</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Voltar</span>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight">{atm.title}</h1>
                    <p className="text-sm text-muted-foreground">Histórico de Atividade</p>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                 <div className="grid auto-rows-max items-start gap-4 md:col-span-2 lg:col-span-3">
                    <StatusHeader poi={atm} onStatusChange={handleStatusChange} />
                     <Card>
                        <CardHeader>
                            <CardTitle>Linha do Tempo de Reportes</CardTitle>
                            <CardDescription>
                                Histórico de todas as contribuições da comunidade para este ATM.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Timeline updates={atm.updates || []} />
                        </CardContent>
                    </Card>
                 </div>
                 <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                    <NoteAnalysis poi={atm} />
                 </div>
            </main>
        </div>
    );
}

export default withAuth(AtmHistoryPage);
