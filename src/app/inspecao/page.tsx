
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
import { ArrowLeft, Search, FileText, User, Calendar, Camera, Send, Loader2, Building, ScanLine } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestUpdate } from "@/lib/data";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Image from "next/image";

function InspectionPage() {
    const { profile } = useAuth();
    const { toast } = useToast();
    const { allData, addUpdateToPoint, loading: loadingPoints } = usePoints();
    const [projectId, setProjectId] = React.useState("");
    const [project, setProject] = React.useState<PointOfInterest | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [vistoriaText, setVistoriaText] = React.useState("");
    const [vistoriaPhoto, setVistoriaPhoto] = React.useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSearch = () => {
        if (!projectId) return;
        setIsLoading(true);
        const foundProject = allData.find(p => p.type === 'construction' && p.id === projectId);
        
        setTimeout(() => { // Simulate network delay
            if (foundProject) {
                setProject(foundProject);
                toast({ title: "Projeto Encontrado", description: `A carregar detalhes para ${foundProject.title}` });
            } else {
                setProject(null);
                toast({ variant: "destructive", title: "Projeto Não Encontrado", description: "O ID inserido não corresponde a nenhum projeto de construção." });
            }
            setIsLoading(false);
        }, 500);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVistoriaPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmitVistoria = async () => {
        if (!project || !vistoriaText.trim() || !profile) return;
        
        setIsSubmitting(true);
        
        const processSubmit = async (photoDataUri?: string) => {
            try {
                const updateData: Omit<PointOfInterestUpdate, 'id'> = {
                    text: `**AUTO DE VISTORIA**\n\n${vistoriaText}`,
                    authorId: profile.uid,
                    authorDisplayName: profile.displayName,
                    timestamp: new Date().toISOString(),
                    ...(photoDataUri && { photoDataUri }),
                };

                await addUpdateToPoint(project.id, updateData);
                
                toast({ title: "Vistoria Submetida", description: "O seu relatório foi adicionado ao processo do projeto." });
                // Reset form
                setVistoriaText("");
                setVistoriaPhoto(null);
                setPhotoPreview(null);
                setProject(null);
                setProjectId("");
            } catch (error) {
                 toast({ variant: "destructive", title: "Erro ao Submeter", description: "Não foi possível guardar o seu relatório." });
            } finally {
                setIsSubmitting(false);
            }
        };

        if (vistoriaPhoto) {
            const reader = new FileReader();
            reader.onloadend = () => {
                processSubmit(reader.result as string);
            };
            reader.readAsDataURL(vistoriaPhoto);
        } else {
            processSubmit();
        }
    };

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
                    Fiscalização de Obra
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Passo 1: Ler Código QR da Licença</CardTitle>
                        <CardDescription>
                            Insira o ID do processo que se encontra na licença da obra para carregar os detalhes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Insira o ID do Processo..." 
                                    className="pl-10"
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={isLoading || loadingPoints}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Procurar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {project && (
                    <div className="space-y-4 animate-in fade-in-50">
                        <Card>
                            <CardHeader>
                                <CardTitle>Passo 2: Verificação Rápida</CardTitle>
                                <CardDescription>Confirme os dados essenciais da licença.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">Projeto:</span>
                                    <span>{project.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">Requerente:</span>
                                    <span>{project.authorDisplayName}</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">Arquiteto:</span>
                                    <span>{project.architectName || 'Não especificado'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">Data da Licença:</span>
                                    <span>{project.lastReported ? new Date(project.lastReported).toLocaleDateString('pt-PT') : 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle>Passo 3: Relatório de Vistoria</CardTitle>
                                <CardDescription>Preencha o seu parecer, anexe fotos se necessário e submeta o relatório.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vistoria-text">Observações da Vistoria</Label>
                                    <Textarea
                                        id="vistoria-text"
                                        placeholder="Descreva a sua análise. Ex: A obra segue o projeto aprovado, não foram detetadas irregularidades."
                                        rows={6}
                                        value={vistoriaText}
                                        onChange={(e) => setVistoriaText(e.target.value)}
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="vistoria-photo">Anexar Fotografia (Prova)</Label>
                                     <Input 
                                        id="vistoria-photo" 
                                        type="file" 
                                        accept="image/*" 
                                        capture="environment"
                                        onChange={handlePhotoChange}
                                        className="h-auto p-1"
                                    />
                                </div>
                                {photoPreview && (
                                    <div className="w-full">
                                        <Image src={photoPreview} alt="Pré-visualização da Vistoria" width={200} height={150} className="rounded-md object-cover" />
                                    </div>
                                )}
                                <Button onClick={handleSubmitVistoria} disabled={isSubmitting || !vistoriaText}>
                                     {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Submeter Relatório
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(InspectionPage, ['Agente Municipal', 'Administrador']);

    