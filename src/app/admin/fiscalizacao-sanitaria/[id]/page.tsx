
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestUpdate } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, FileText, ClipboardCheck, MessageSquare, ExternalLink, Loader2, Hospital } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Timeline from "@/components/timeline";
import { Input } from "@/components/ui/input";

const InspectionControl = ({ unit, addUpdateToPoint }: { unit: PointOfInterest, addUpdateToPoint: any }) => {
    const { profile } = useAuth();
    const [reportText, setReportText] = React.useState("");
    const [photoFile, setPhotoFile] = React.useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!reportText.trim() || !profile) return;
        
        setIsSubmitting(true);
        const processSubmit = async (photoDataUri?: string) => {
            try {
                const newUpdate: Omit<PointOfInterestUpdate, 'id'> = {
                    text: `**RELATÓRIO DE VISTORIA**\n${reportText}`,
                    authorId: profile.uid,
                    authorDisplayName: profile.displayName,
                    timestamp: new Date().toISOString(),
                    ...(photoDataUri && { photoDataUri }),
                };
                await addUpdateToPoint(unit.id, newUpdate);
                toast({ title: "Relatório Adicionado", description: "O seu relatório de vistoria foi guardado no histórico da unidade." });
                setReportText("");
                setPhotoFile(null);
                setPhotoPreview(null);
            } catch (error) {
                toast({ variant: "destructive", title: "Erro", description: "Não foi possível guardar o relatório." });
            } finally {
                setIsSubmitting(false);
            }
        }
        
        if (photoFile) {
            const reader = new FileReader();
            reader.onloadend = () => processSubmit(reader.result as string);
            reader.readAsDataURL(photoFile);
        } else {
            processSubmit();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registar Nova Vistoria</CardTitle>
                <CardDescription>Documente a sua visita técnica a esta unidade sanitária.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="Descreva as suas observações, conformidades e não-conformidades encontradas..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    rows={6}
                />
                <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                {photoPreview && <Image src={photoPreview} alt="Preview da foto" width={200} height={150} className="rounded-md object-cover" />}
                <Button onClick={handleSubmit} disabled={isSubmitting || !reportText.trim()}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
                    Adicionar Relatório de Vistoria
                </Button>
            </CardContent>
        </Card>
    );
};

function HealthUnitDetailPage() {
    const params = useParams();
    const unitId = params.id as string;
    const { profile } = useAuth();
    const { allData, loading: loadingPoints, addUpdateToPoint } = usePoints();
    const [unit, setUnit] = React.useState<PointOfInterest | null>(null);

    React.useEffect(() => {
        if (allData.length > 0) {
            const foundUnit = allData.find(p => p.id === unitId);
            setUnit(foundUnit || null);
        }
    }, [allData, unitId]);

    if (loadingPoints) {
        return <div className="flex min-h-screen items-center justify-center">A carregar detalhes da unidade...</div>;
    }

    if (!unit) {
        return <div className="flex min-h-screen items-center justify-center">Unidade Sanitária não encontrada.</div>;
    }

    const isManager = profile?.role === 'Agente Municipal' || profile?.role === 'Administrador' || profile?.role === 'Epidemiologista';

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/admin/fiscalizacao-sanitaria">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight">{unit.title}</h1>
                    <p className="text-sm text-muted-foreground">ID da Unidade: {unit.id}</p>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                <div className="grid auto-rows-max items-start gap-4 md:col-span-2 lg:col-span-3">
                    {isManager && <InspectionControl unit={unit} addUpdateToPoint={addUpdateToPoint} />}
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Vistorias e Comunicações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Timeline poi={unit} onAddUpdate={() => {}} />
                        </CardContent>
                    </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado da Licença</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Badge variant="secondary">{unit.licensingStatus || "Não especificado"}</Badge>
                            <div className="text-sm">
                                <p className="text-muted-foreground">Última Vistoria:</p>
                                <p>{unit.lastInspectionDate ? new Date(unit.lastInspectionDate).toLocaleDateString('pt-PT') : 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Documentos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {unit.files && unit.files.length > 0 ? (
                                <div className="space-y-3">
                                    {unit.files.map((file, index) => (
                                        <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-muted">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-6 w-6 text-muted-foreground" />
                                                <p className="text-sm font-medium">{file.name}</p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default withAuth(HealthUnitDetailPage, ['Agente Municipal', 'Administrador', 'Epidemiologista']);
