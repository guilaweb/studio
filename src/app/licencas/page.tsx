
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Building, Upload, MapPin, Search, Loader2, FileText, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, statusLabelMap, PointOfInterestUsageType } from "@/lib/data";
import { analyzeProjectComplianceFlow } from "@/ai/flows/analyze-project-compliance-flow";
import { Badge } from "@/components/ui/badge";

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

const LandPlotPolygons: React.FC<{
    plots: PointOfInterest[];
    selectedPlotId: string | null;
    onPlotClick: (plotId: string) => void;
}> = ({ plots, selectedPlotId, onPlotClick }) => {
    const map = useMap();
    const [polygons, setPolygons] = React.useState<google.maps.Polygon[]>([]);

    React.useEffect(() => {
        if (!map) return;
        
        // Clear old polygons
        polygons.forEach(p => p.setMap(null));

        const newPolygons = plots.map(plot => {
            const isSelected = plot.id === selectedPlotId;
            const poly = new google.maps.Polygon({
                paths: plot.polygon,
                strokeColor: isSelected ? 'hsl(var(--ring))' : 'hsl(var(--primary))',
                strokeOpacity: 0.9,
                strokeWeight: isSelected ? 3 : 2,
                fillColor: isSelected ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--primary) / 0.2)',
                fillOpacity: 0.35,
                map: map,
            });

            poly.addListener('click', () => {
                onPlotClick(plot.id);
            });
            return poly;
        });

        setPolygons(newPolygons);

        return () => {
            // Cleanup on component unmount
            newPolygons.forEach(p => p.setMap(null));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, plots, selectedPlotId]);


    return null;
}

const SelectedPlotInfo: React.FC<{plot: PointOfInterest}> = ({plot}) => {
     const usageTypeMap: Record<string, string> = {
        residential: "Residencial",
        commercial: "Comercial",
        industrial: "Industrial",
        mixed: "Misto",
        other: "Outro",
    }
    
    return (
        <div className="space-y-4 rounded-md border p-4 bg-muted/50">
            <h4 className="text-sm font-semibold">Informação do Lote Selecionado</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                    <p className="text-muted-foreground">Estado</p>
                    <p className="font-medium">{plot.status ? statusLabelMap[plot.status] : "N/A"}</p>
                </div>
                 {plot.usageType && (
                    <div>
                        <p className="text-muted-foreground">Uso Permitido</p>
                        <p className="font-medium">{usageTypeMap[plot.usageType]}</p>
                    </div>
                )}
                 {plot.maxHeight !== undefined && (
                    <div>
                        <p className="text-muted-foreground">Altura Máx. (Pisos)</p>
                        <p className="font-medium">{plot.maxHeight}</p>
                    </div>
                )}
                {plot.buildingRatio !== undefined && (
                     <div>
                        <p className="text-muted-foreground">Índice Construção</p>
                        <p className="font-medium">{plot.buildingRatio}%</p>
                    </div>
                )}
            </div>
            {plot.zoningInfo && (
                <div className="mt-2">
                    <p className="text-muted-foreground text-sm">Notas de Zoneamento</p>
                    <p className="text-sm font-medium whitespace-pre-wrap">{plot.zoningInfo}</p>
                </div>
            )}
        </div>
    )
}


function LicencasPage() {
    const { toast } = useToast();
    const { profile, user } = useAuth();
    const { allData, addPoint } = usePoints();
    const [files, setFiles] = React.useState<File[]>([]);
    const [selectedPlot, setSelectedPlot] = React.useState<PointOfInterest | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);

    const landPlots = React.useMemo(() => allData.filter(p => p.type === 'land_plot' && p.polygon), [allData]);
    const userProjects = React.useMemo(() => allData.filter(p => p.type === 'construction' && p.authorId === user?.uid), [allData, user]);


    const handlePlotSelect = (plotId: string) => {
        const plot = landPlots.find(p => p.id === plotId) || null;
        setSelectedPlot(plot);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;
        setIsSubmitting(true);

        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const projectData = Object.fromEntries(formData.entries());

        if (!selectedPlot) {
            toast({
                variant: "destructive",
                title: "Lote não selecionado",
                description: "Por favor, selecione um lote no mapa para submeter o projeto.",
            });
            setIsSubmitting(false);
            return;
        }

        const newProjectId = `proj-${Date.now()}`;
        const newProject: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] } = {
            id: newProjectId,
            type: 'construction',
            title: projectData.projectName as string,
            description: projectData.projectDescription as string,
            projectType: projectData.projectType as string,
            architectName: projectData.architectName as string,
            authorId: user.uid,
            authorDisplayName: profile.displayName,
            status: 'submitted',
            landPlotId: selectedPlot.id,
            position: selectedPlot.position,
            lastReported: new Date().toISOString(),
            updates: [{
                text: 'Projeto submetido para análise.',
                authorId: user.uid,
                authorDisplayName: profile?.displayName || "Requerente",
                timestamp: new Date().toISOString()
            }]
        };

        // First, submit the project to the database
        await addPoint(newProject);
        
        toast({
            title: "Submissão Recebida",
            description: `O seu projeto para o lote ${selectedPlot.plotNumber || selectedPlot.id} foi submetido com sucesso.`,
        });


        // Then, run the AI compliance check as an assistive tool
        try {
            const complianceResult = await analyzeProjectComplianceFlow({
                projectType: projectData.projectType as string,
                projectDescription: projectData.projectDescription as string,
                plotZoning: {
                    usageType: selectedPlot.usageType as PointOfInterestUsageType,
                    maxHeight: selectedPlot.maxHeight,
                    buildingRatio: selectedPlot.buildingRatio,
                    zoningInfo: selectedPlot.zoningInfo,
                }
            });

            if (complianceResult.isCompliant) {
                toast({
                    title: "Análise IA: Em Conformidade",
                    description: complianceResult.analysis,
                    duration: 8000,
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Análise IA: Potencial Inconformidade",
                    description: `${complianceResult.analysis} O seu projeto foi submetido, mas poderá requerer revisão manual.`,
                    duration: 10000,
                });
            }
        } catch (error) {
             console.error("Error analyzing project compliance:", error);
            toast({
                variant: "destructive",
                title: "Erro na Análise de IA",
                description: "Não foi possível realizar a verificação automática. O seu projeto será revisto manualmente.",
            });
        } finally {
            setIsSubmitting(false);
            formRef.current?.reset();
            setFiles([]);
            setSelectedPlot(null);
        }
    };

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar ao Mapa</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Gestão de Licenças de Construção
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                        <div className="grid gap-4 md:grid-cols-2">
                             <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Submeter Novo Projeto</CardTitle>
                                    <CardDescription>
                                        Selecione o lote no mapa e preencha o formulário para iniciar o processo de licenciamento. A nossa IA fará uma pré-análise.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
                                        
                                        {selectedPlot && <SelectedPlotInfo plot={selectedPlot} />}
                                        
                                        <Separator />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="plotNumber">Nº do Lote</Label>
                                                <Input id="plotNumber" value={selectedPlot?.plotNumber || ''} readOnly disabled placeholder="Selecione um lote no mapa" />
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor="plotRegistry">Registo Predial</Label>
                                                <Input id="plotRegistry" value={selectedPlot?.registrationCode || ''} readOnly disabled placeholder="Selecione um lote no mapa" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="projectName">Nome do Projeto</Label>
                                            <Input id="projectName" name="projectName" placeholder="Ex: Construção de Moradia Unifamiliar" required/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="requesterName">Nome do Requerente</Label>
                                            <Input id="requesterName" name="requesterName" value={profile?.displayName || ''} readOnly disabled/>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="projectType">Tipo de Projeto</Label>
                                            <Select required name="projectType">
                                                <SelectTrigger id="projectType">
                                                    <SelectValue placeholder="Selecione o tipo de obra" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new-build">Construção Nova</SelectItem>
                                                    <SelectItem value="remodel">Remodelação</SelectItem>
                                                    <SelectItem value="expansion">Ampliação</SelectItem>
                                                    <SelectItem value="demolition">Demolição</SelectItem>
                                                    <SelectItem value="other">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <Separator />

                                        <div className="space-y-4 rounded-md border p-4">
                                            <h4 className="text-sm font-semibold">Dados do Arquiteto Responsável</h4>
                                            <div className="space-y-2">
                                                <Label htmlFor="architectName">Nome Completo do Arquiteto</Label>
                                                <Input id="architectName" name="architectName" placeholder="Insira o nome do arquiteto" required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="architectLicense">Nº da Carteira Profissional</Label>
                                                    <Input id="architectLicense" name="architectLicense" placeholder="Ex: 12345N" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="architectIdCard">Nº do BI</Label>
                                                    <Input id="architectIdCard" name="architectIdCard" placeholder="Ex: 12345678" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="architectNif">NIF</Label>
                                                <Input id="architectNif" name="architectNif" placeholder="Ex: 123456789" required />
                                            </div>
                                        </div>
                                        
                                        <Separator />

                                        <div className="space-y-2">
                                            <Label htmlFor="projectDescription">Descrição do Projeto</Label>
                                            <Textarea id="projectDescription" name="projectDescription" placeholder="Descreva brevemente os trabalhos a realizar." rows={4} required/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="documents">Anexar Documentos</Label>
                                            <Input 
                                                id="documents" 
                                                type="file" 
                                                multiple
                                                onChange={handleFileChange}
                                                className="h-auto p-1"
                                                name="documents"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Anexe plantas, memória descritiva, etc.
                                            </p>
                                            {files.length > 0 && (
                                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                                    {files.map(file => <li key={file.name}>{file.name}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                        <Button type="submit" className="w-full" disabled={!selectedPlot || isSubmitting}>
                                            {isSubmitting ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="mr-2 h-4 w-4" />
                                            )}
                                            Submeter para Aprovação
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                             <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Meus Projetos Submetidos</CardTitle>
                                    <CardDescription>
                                        Acompanhe o estado de aprovação das suas licenças.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {userProjects.length > 0 ? (
                                        <div className="space-y-4">
                                            {userProjects.map(project => {
                                                const plot = landPlots.find(p => p.id === project.landPlotId);
                                                return (
                                                    <Card key={project.id}>
                                                        <CardContent className="p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold">{project.title}</p>
                                                                    <p className="text-sm text-muted-foreground">Lote: {plot?.plotNumber || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant={project.status === 'approved' ? 'default' : 'secondary'} className={
                                                                project.status === 'approved' ? 'bg-green-600 text-white' : 
                                                                project.status === 'rejected' ? 'bg-red-600 text-white' :
                                                                ''
                                                            }>
                                                                {project.status ? statusLabelMap[project.status] : "N/A"}
                                                            </Badge>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                                            <Building className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold">Ainda não submeteu projetos.</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Quando submeter um pedido de licença, poderá acompanhar o seu estado aqui.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mapa de Cadastro</CardTitle>
                                <CardDescription>
                                    Clique num lote disponível no mapa para o selecionar.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[500px] p-0 relative">
                                <Map
                                    defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                                    defaultZoom={13}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                    styles={mapStyles}
                                >
                                    <LandPlotPolygons 
                                        plots={landPlots}
                                        selectedPlotId={selectedPlot?.id || null}
                                        onPlotClick={handlePlotSelect}
                                    />
                                </Map>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardContent className="pt-6">
                               <p className="text-xs text-muted-foreground">
                                  Necessita de trabalhar com o Sistema Geodésico Nacional? <Link href="/geodesia" className="underline font-semibold">Consulte a nossa página de informação técnica.</Link>
                               </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(LicencasPage);

    