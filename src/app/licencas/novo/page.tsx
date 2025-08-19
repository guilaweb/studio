
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import LandPlotSearch, { type SearchFilters } from "@/components/licencas/land-plot-search";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { analyzeProjectComplianceFlow } from "@/ai/flows/analyze-project-compliance-flow";
import ComplianceChecklist from "@/components/licencas/compliance-checklist";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
    projectName: z.string().min(5, "O nome do projeto é obrigatório."),
    projectType: z.string({ required_error: "O tipo de projeto é obrigatório." }),
    architectName: z.string().min(3, "O nome do arquiteto é obrigatório."),
    projectDescription: z.string().min(10, "A descrição é obrigatória."),
});


function NewLicensePage() {
    const { allData, addPoint } = usePoints();
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [step, setStep] = React.useState(1);
    const [searchFilters, setSearchFilters] = React.useState<SearchFilters>({ location: '', area: null, usageType: null });
    const [selectedPlot, setSelectedPlot] = React.useState<PointOfInterest | null>(null);
    const [complianceResult, setComplianceResult] = React.useState<any>(null);
    const [isCheckingCompliance, setIsCheckingCompliance] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { projectName: "", projectType: undefined, architectName: "", projectDescription: "" },
    });
    
    const landPlots = React.useMemo(() => allData.filter(p => p.type === 'land_plot' && p.status === 'available'), [allData]);

    const filteredLandPlots = React.useMemo(() => {
        return landPlots.filter(plot => {
            const { location, area, usageType } = searchFilters;
            const locationMatch = !location || (plot.title.toLowerCase().includes(location.toLowerCase()));
            const areaMatch = !area || (plot.area && plot.area >= area);
            const usageMatch = !usageType || plot.usageType === usageType;
            return locationMatch && areaMatch && usageMatch;
        });
    }, [landPlots, searchFilters]);

    const handleSelectPlot = (plot: PointOfInterest) => {
        setSelectedPlot(plot);
        setStep(2);
    };

    const handleCheckCompliance = async (projectData: z.infer<typeof formSchema>) => {
        if (!selectedPlot) return;
        setIsCheckingCompliance(true);
        try {
            const result = await analyzeProjectComplianceFlow({
                projectType: projectData.projectType,
                projectDescription: projectData.projectDescription,
                plotZoning: {
                    usageType: selectedPlot.usageType,
                    maxHeight: selectedPlot.maxHeight,
                    buildingRatio: selectedPlot.buildingRatio,
                    zoningInfo: selectedPlot.zoningInfo,
                }
            });
            setComplianceResult(result);
            setStep(3);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro de IA", description: "Não foi possível realizar a análise de conformidade." });
        } finally {
            setIsCheckingCompliance(false);
        }
    };
    
    const handleSubmit = async () => {
        if (!selectedPlot || !user || !profile || !complianceResult) return;
        
        setIsSubmitting(true);
        const projectData = form.getValues();
        const pointToAdd = {
            id: `construction-${Date.now()}`,
            type: 'construction' as const,
            landPlotId: selectedPlot.id,
            title: projectData.projectName,
            description: projectData.projectDescription,
            projectType: projectData.projectType,
            architectName: projectData.architectName,
            position: selectedPlot.position,
            authorId: user.uid,
            authorDisplayName: profile.displayName,
            lastReported: new Date().toISOString(),
            status: 'submitted' as const,
            updates: [{
                id: `update-${Date.now()}`,
                text: 'Pedido de licença submetido.',
                authorId: user.uid,
                authorDisplayName: profile.displayName,
                timestamp: new Date().toISOString()
            }]
        };

        try {
            await addPoint(pointToAdd);
            toast({ title: "Pedido Submetido!", description: "O seu pedido de licença foi enviado para análise."});
            // Here you would typically redirect the user to the list of their licenses
            setStep(1);
            setSelectedPlot(null);
            form.reset();
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível submeter o pedido." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const progress = (step / 3) * 100;

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/licencas">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Novo Pedido de Licenciamento
                    </h1>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6">
                   <Card className="w-full max-w-4xl mx-auto">
                        <CardHeader>
                            <Progress value={progress} className="mb-4" />
                            <CardTitle>Passo {step}: {step === 1 ? 'Selecionar o Lote' : step === 2 ? 'Detalhes do Projeto' : 'Análise e Submissão'}</CardTitle>
                            <CardDescription>
                                {step === 1 ? 'Encontre e selecione o lote onde pretende construir.' : step === 2 ? 'Preencha os detalhes do seu projeto de construção.' : 'Reveja a análise de conformidade e submeta o seu pedido.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {step === 1 && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <LandPlotSearch onSearch={setSearchFilters} initialFilters={searchFilters} />
                                        <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2">
                                            {filteredLandPlots.map(plot => (
                                                <Card key={plot.id} className="p-3 cursor-pointer hover:bg-muted" onClick={() => handleSelectPlot(plot)}>
                                                    <p className="font-semibold">{plot.title}</p>
                                                    <p className="text-sm text-muted-foreground">Área: {plot.area} m² | Uso: {plot.usageType}</p>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-[60vh] md:h-full rounded-md overflow-hidden">
                                        <Map mapId="license-map" defaultCenter={{lat: -8.83, lng: 13.23}} defaultZoom={12} gestureHandling="greedy">
                                            {filteredLandPlots.map(plot => (
                                                <AdvancedMarker key={plot.id} position={plot.position} onClick={() => handleSelectPlot(plot)}>
                                                    <Pin />
                                                </AdvancedMarker>
                                            ))}
                                        </Map>
                                    </div>
                                </div>
                            )}
                            {step === 2 && selectedPlot && (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleCheckCompliance)} className="space-y-6">
                                        <FormField control={form.control} name="projectName" render={({ field }) => (
                                            <FormItem><FormLabel>Nome do Projeto</FormLabel><FormControl><Input placeholder="Ex: Construção de Moradia Unifamiliar" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="grid md:grid-cols-2 gap-4">
                                             <FormField control={form.control} name="projectType" render={({ field }) => (
                                                <FormItem><FormLabel>Tipo de Projeto</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo de obra" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="new-build">Construção Nova</SelectItem>
                                                            <SelectItem value="remodel">Remodelação</SelectItem>
                                                            <SelectItem value="expansion">Ampliação</SelectItem>
                                                            <SelectItem value="demolition">Demolição</SelectItem>
                                                            <SelectItem value="other">Outro</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                <FormMessage /></FormItem>
                                            )} />
                                             <FormField control={form.control} name="architectName" render={({ field }) => (
                                                <FormItem><FormLabel>Nome do Arquiteto</FormLabel><FormControl><Input placeholder="Insira o nome do arquiteto" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="projectDescription" render={({ field }) => (
                                            <FormItem><FormLabel>Descrição do Projeto</FormLabel><FormControl><Textarea placeholder="Descreva brevemente os trabalhos a realizar." rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="flex justify-between">
                                            <Button type="button" variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                                            <Button type="submit" disabled={isCheckingCompliance}>
                                                {isCheckingCompliance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                Verificar Conformidade (IA)
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            )}
                            {step === 3 && complianceResult && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium">Análise de Conformidade Preliminar (Pré-Fiscal)</h3>
                                    <ComplianceChecklist result={complianceResult} />
                                    <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md">
                                        <p><strong>Atenção:</strong> Esta é uma análise preliminar e automática gerada por IA. Não substitui a análise técnica completa por um funcionário municipal. Serve como um guia para ajudar a identificar potenciais problemas antes da submissão formal.</p>
                                    </div>
                                    <p className="text-sm">O próximo passo é carregar os documentos do projeto (plantas, memória descritiva, etc). Esta funcionalidade será adicionada em breve. Por agora, pode submeter o pedido para registo inicial.</p>
                                    <div className="flex justify-between">
                                        <Button type="button" variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Submeter Pedido de Licença
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                   </Card>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(NewLicensePage);
