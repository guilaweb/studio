

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { useUserProfile } from "@/services/user-service";
import { PointOfInterest, PointOfInterestUpdate, statusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Building, User, FileText, Briefcase, Calendar, MessageSquare, Check, X, Circle, Loader2, Wand2, ThumbsUp, ThumbsDown, AlertTriangle, FileCheck, ClipboardCheck, Download, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateOfficialResponse } from "@/ai/flows/generate-official-response-flow";
import WorkflowSuggestions from "@/components/admin/projetos/workflow-suggestions";
import { generateLicense } from "@/ai/flows/generate-license-flow";

const getStatusIcon = (update: PointOfInterestUpdate, isFirst: boolean) => {
    if (isFirst) {
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
    if (update.text.startsWith('**AUTO DE VISTORIA**')) {
        return <ClipboardCheck className="h-4 w-4 text-blue-500" />;
    }
    if (update.text.startsWith('**PARECER')) {
        return <Check className="h-4 w-4 text-green-500" />;
    }
    return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
}

const Timeline = ({ updates }: { updates: PointOfInterestUpdate[] }) => {
     if (!updates || updates.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Sem atualizações ou comunicações registadas.</p>
    }
    
    const sortedUpdates = [...updates].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border before:-translate-x-px">
            {sortedUpdates.map((update, index) => {
                const isVistoria = update.text.startsWith('**AUTO DE VISTORIA**');
                return (
                    <div key={update.id} className="relative flex items-start gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${isVistoria ? 'bg-blue-50' : 'bg-background'} z-10`}>
                            {getStatusIcon(update, index === 0)}
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="font-semibold text-sm whitespace-pre-wrap">{update.text}</p>
                            <p className="text-xs text-muted-foreground">
                                Por {update.authorDisplayName || 'Sistema'} • {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true, locale: pt })}
                            </p>
                            {update.photoDataUri && (
                                <div className="mt-2">
                                    <a href={update.photoDataUri} target="_blank" rel="noopener noreferrer">
                                        <img src={update.photoDataUri} alt="Documento ou foto anexa" className="rounded-md object-cover max-h-40 border" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function AdminProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;
    const { profile: adminProfile, user } = useAuth();
    const { allData, loading: loadingPoints, addUpdateToPoint } = usePoints();
    const [project, setProject] = React.useState<PointOfInterest | null>(null);
    const { user: applicant, loading: loadingApplicant } = useUserProfile(project?.authorId || null);
    const [updateText, setUpdateText] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const {toast} = useToast();
    const [licenseHtml, setLicenseHtml] = React.useState<string | null>(null);
    const [isGeneratingLicense, setIsGeneratingLicense] = React.useState(false);


    React.useEffect(() => {
        if (allData.length > 0) {
            const foundProject = allData.find(p => p.id === projectId);
            setProject(foundProject || null);
        }
    }, [allData, projectId]);

    const handleAddUpdate = async () => {
        if (!project || !updateText.trim() || !adminProfile) return;

        setIsSubmitting(true);
        try {
            const newUpdate: Omit<PointOfInterestUpdate, 'id'> = {
                text: updateText,
                authorId: adminProfile.uid,
                authorDisplayName: adminProfile.displayName,
                timestamp: new Date().toISOString(),
            };
            await addUpdateToPoint(project.id, newUpdate);
            setUpdateText("");
            toast({
                title: "Comunicação Adicionada",
                description: "A sua mensagem foi adicionada à linha do tempo do projeto."
            });
        } catch (error) {
            console.error("Failed to add update", error);
             toast({
                variant: "destructive",
                title: "Erro",
                description: "Não foi possível adicionar a sua comunicação."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateResponse = async () => {
        if (!project) return;
        const lastCitizenUpdate = [...(project.updates || [])]
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .find(u => u.authorId !== user?.uid);
        
        if (!lastCitizenUpdate) {
            toast({
                variant: "destructive",
                title: "Não há contribuições para responder",
                description: "A IA só pode gerar respostas para contribuições de cidadãos.",
            });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateOfficialResponse({
                citizenContribution: lastCitizenUpdate.text,
                projectName: project.title,
            });
            setUpdateText(result.response);
        } catch (error) {
            console.error("Error generating AI response:", error);
            toast({
                variant: "destructive",
                title: "Erro ao gerar resposta",
                description: "Não foi possível gerar uma resposta com IA. Tente novamente.",
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleGenerateLicense = async () => {
        if (!project || !applicant) return;

        setIsGeneratingLicense(true);
        try {
            const result = await generateLicense({
                projectName: project.title,
                projectId: project.id,
                requesterName: applicant.displayName,
                architectName: project.architectName,
                plotNumber: project.plotNumber,
                plotRegistration: project.registrationCode,
                issueDate: new Date().toLocaleDateString('pt-PT'),
            });
            setLicenseHtml(result.licenseHtml);
            toast({
                title: "Licença Digital Gerada",
                description: "A licença foi gerada com sucesso e está pronta para visualização.",
            });
        } catch (error) {
            console.error("Failed to generate license:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Gerar Licença",
                description: "Não foi possível gerar a licença. Tente novamente.",
            });
        } finally {
            setIsGeneratingLicense(false);
        }
    };

    const handleViewLicense = () => {
        if (!licenseHtml) return;
        localStorage.setItem('licensePreview', licenseHtml);
        window.open('/licenca/preview', '_blank');
    };
    
    const setParecerTemplate = (templateType: 'favoravel' | 'condicionantes' | 'desfavoravel') => {
        const templates = {
            favoravel: "**PARECER FAVORÁVEL**\n\nApós análise do processo, o projeto cumpre com todos os regulamentos aplicáveis. Recomenda-se a aprovação.",
            condicionantes: "**PARECER FAVORÁVEL COM CONDICIONANTES**\n\nO projeto é aprovado, sujeito ao cumprimento das seguintes condições:\n1. [Condição 1]\n2. [Condição 2]\n\nApós o cumprimento, o processo poderá avançar para a fase seguinte.",
            desfavoravel: "**PARECER DESFAVORÁVEL**\n\nO projeto não cumpre com os regulamentos pelos seguintes motivos:\n1. [Motivo 1 - Ex: Violação do recuo frontal]\n2. [Motivo 2 - Ex: Índice de ocupação excede o permitido]\n\nRecomenda-se a rejeição do pedido ou a submissão de um novo projeto corrigido."
        };
        setUpdateText(templates[templateType]);
    }


    if (loadingPoints || loadingApplicant) {
        return <div className="flex min-h-screen items-center justify-center">A carregar detalhes do projeto...</div>;
    }

    if (!project) {
        return <div className="flex min-h-screen items-center justify-center">Projeto não encontrado.</div>;
    }
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/admin/projetos">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight">{project.title}</h1>
                    <p className="text-sm text-muted-foreground">ID do Processo: {project.id}</p>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                 <div className="grid auto-rows-max items-start gap-4 md:col-span-2 lg:col-span-3">
                    <WorkflowSuggestions project={project} />
                     <Card>
                        <CardHeader>
                            <CardTitle>Linha do Tempo, Comunicações e Pareceres</CardTitle>
                            <CardDescription>
                                Histórico completo de todas as interações e fases do processo de licenciamento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Timeline updates={project.updates || []} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Comunicação ou Parecer</CardTitle>
                            <CardDescription>Use os modelos para emitir um parecer ou escreva uma comunicação livre.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => setParecerTemplate('favoravel')}>
                                    <ThumbsUp className="mr-2 h-4 w-4" />
                                    Parecer Favorável
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setParecerTemplate('condicionantes')}>
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Parecer com Condicionantes
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setParecerTemplate('desfavoravel')}>
                                    <ThumbsDown className="mr-2 h-4 w-4" />
                                    Parecer Desfavorável
                                </Button>
                            </div>
                            <Textarea 
                                placeholder="Escreva aqui a sua comunicação, parecer ou despacho..." 
                                value={updateText}
                                onChange={(e) => setUpdateText(e.target.value)}
                                rows={8}
                            />
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={handleAddUpdate} disabled={isSubmitting || !updateText.trim()}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4"/>}
                                    Adicionar à Linha do Tempo
                                </Button>
                                <Button variant="outline" onClick={handleGenerateResponse} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Gerar Resposta (IA)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                     {project.status === 'approved' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Emissão de Licença Digital</CardTitle>
                                <CardDescription>O processo foi aprovado. Gere a licença final para o requerente.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!licenseHtml ? (
                                    <Button onClick={handleGenerateLicense} disabled={isGeneratingLicense}>
                                        {isGeneratingLicense ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck className="mr-2 h-4 w-4" />}
                                        Gerar Licença
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-4 rounded-lg border p-4 bg-green-50 text-green-800 border-green-200">
                                        <FileCheck className="h-8 w-8" />
                                        <div>
                                            <p className="font-semibold">Licença do Projeto</p>
                                            <p className="text-sm">Gerada e pronta para visualização.</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="ml-auto text-green-800 border-green-800/50 hover:bg-green-100 hover:text-green-900" onClick={handleViewLicense}>
                                            Ver Licença
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos do Projeto</CardTitle>
                            <CardDescription>
                                Ficheiros submetidos pelo requerente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {project.files && project.files.length > 0 ? (
                                <div className="space-y-3">
                                    {project.files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                            <div className="flex items-center gap-4">
                                                <FileText className="h-8 w-8 text-muted-foreground" />
                                                <div>
                                                    <p className="font-semibold">{file.name}</p>
                                                    <p className="text-sm text-muted-foreground">Submetido em {new Date(project.lastReported!).toLocaleDateString('pt-PT')}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                   Ver Documento
                                                   <ExternalLink className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                    Nenhum documento foi submetido para este projeto.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 </div>
                 <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado do Processo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Estado Atual</span>
                                <Badge variant={project.status === 'approved' ? 'default' : (project.status === 'rejected' ? 'destructive' : 'secondary')} className={project.status === 'approved' ? 'bg-green-600' : ''}>
                                    {project.status ? statusLabelMap[project.status] : "N/A"}
                                </Badge>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Data Submissão</span>
                                <span>{new Date(project.lastReported!).toLocaleDateString('pt-PT')}</span>
                             </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes do Projeto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <p><span className="font-semibold">Tipo:</span> {project.projectType || "Não especificado"}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <p><span className="font-semibold">Arquiteto:</span> {project.architectName || "Não especificado"}</p>
                            </div>
                            <Separator className="my-4"/>
                            <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Requerente</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {applicant && (
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={applicant.photoURL} />
                                        <AvatarFallback>{applicant.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{applicant.displayName}</p>
                                        <p className="text-sm text-muted-foreground">{applicant.email}</p>
                                        <Link href={`/public-profile/${applicant.uid}`} className="text-xs text-primary hover:underline">Ver Perfil Público</Link>
                                    </div>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </div>
    );
}

export default withAuth(AdminProjectDetailPage, ['Agente Municipal', 'Administrador']);
