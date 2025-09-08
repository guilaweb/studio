
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Plus, Share2, Folder, Upload, Route, MoreVertical, Edit, FileSignature, Loader2 } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CroquiEditDialog from "@/components/meus-croquis/croqui-edit-dialog";

const CroquiCard = ({ croqui, onShare, onSelect, isSelected, onEdit, onGenerateDocument }: { croqui: PointOfInterest, onShare: (id: string, title: string) => void, onSelect: (id: string, selected: boolean) => void, isSelected: boolean, onEdit: (croqui: PointOfInterest) => void, onGenerateDocument: (croqui: PointOfInterest) => void }) => {
    return (
        <Card className={`transition-colors ${isSelected ? 'bg-primary/10 border-primary' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelect(croqui.id, !!checked)}
                        aria-label={`Selecionar ${croqui.title}`}
                    />
                    <Share2 className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{croqui.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Criado em: {new Date(croqui.lastReported!).toLocaleDateString('pt-PT')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 ml-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/croquis/${croqui.id}`} target="_blank">Ver</Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onShare(croqui.id, croqui.title || 'Croqui')}>
                                <Share2 className="mr-2 h-4 w-4" /> Partilhar Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(croqui)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar / Mover
                            </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => onGenerateDocument(croqui)}>
                                <FileSignature className="mr-2 h-4 w-4" /> Ver Documento
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    )
}

function MeusCroquisPage() {
    const { user } = useAuth();
    const { allData, loading, updatePointDetails } = usePoints();
    const router = useRouter();
    const { toast } = useToast();
    const [selectedCroquis, setSelectedCroquis] = React.useState<string[]>([]);
    const [croquiToEdit, setCroquiToEdit] = React.useState<PointOfInterest | null>(null);

    const userCroquisByCollection = React.useMemo(() => {
        if (!user) return {};
        const croquis = allData.filter(p => p.type === 'croqui' && p.authorId === user.uid);
        
        return croquis.reduce((acc, croqui) => {
            const collectionName = croqui.collectionName || 'Croquis Individuais';
            if (!acc[collectionName]) {
                acc[collectionName] = [];
            }
            acc[collectionName].push(croqui);
            return acc;
        }, {} as Record<string, PointOfInterest[]>);

    }, [allData, user]);

    const handleShare = (id: string, title: string) => {
        const shareUrl = `${window.location.origin}/croquis/${id}`;
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link do Croqui Copiado!", description: "Pode agora colá-lo em qualquer aplicação de mensagens." });
    };
    
    const handleSelectCroqui = (id: string, selected: boolean) => {
        setSelectedCroquis(prev => {
            if (selected) {
                return [...prev, id];
            } else {
                return prev.filter(croquiId => croquiId !== id);
            }
        });
    };

    const handleOptimizeRoute = () => {
        const selectedPoints = allData.filter(p => selectedCroquis.includes(p.id));
        if (selectedPoints.length < 2) {
            toast({
                variant: 'destructive',
                title: "Pontos insuficientes",
                description: "Selecione pelo menos dois croquis para otimizar uma rota.",
            });
            return;
        }

        sessionStorage.setItem('routeToOptimize', JSON.stringify(selectedPoints));
        router.push('/');
    };

    const handleEditCroqui = (croqui: PointOfInterest) => {
        setCroquiToEdit(croqui);
    }
    
    const handleSaveChanges = async (id: string, title: string, collectionName: string) => {
        await updatePointDetails(id, { title, collectionName });
        toast({ title: "Croqui Atualizado!", description: "As suas alterações foram guardadas com sucesso." });
        setCroquiToEdit(null);
    };
    
    const handleGenerateDocument = (croqui: PointOfInterest) => {
        router.push(`/croquis/${croqui.id}/documento`);
    };


    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">A carregar os seus croquis...</div>;
    }

    const hasCroquis = Object.keys(userCroquisByCollection).length > 0;

    return (
        <>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar ao Mapa</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Meus Croquis e POIs
                    </h1>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.push('/meus-croquis/importar')}>
                            <Upload className="mr-2 h-4 w-4" />
                            Importar em Massa
                        </Button>
                        <Button variant="secondary" onClick={handleOptimizeRoute} disabled={selectedCroquis.length < 2}>
                            <Route className="mr-2 h-4 w-4" />
                            Otimizar Rota ({selectedCroquis.length})
                        </Button>
                        <Button onClick={() => router.push('/?#report-croqui')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Novo
                        </Button>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6">
                    {hasCroquis ? (
                        <div className="space-y-6">
                            {Object.entries(userCroquisByCollection).map(([collectionName, croquis]) => (
                                <Card key={collectionName}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Folder className="h-5 w-5 text-primary" />
                                            {collectionName}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {croquis.map(c => (
                                            <CroquiCard 
                                                key={c.id} 
                                                croqui={c} 
                                                onShare={handleShare} 
                                                onSelect={handleSelectCroqui}
                                                isSelected={selectedCroquis.includes(c.id)}
                                                onEdit={handleEditCroqui}
                                                onGenerateDocument={handleGenerateDocument}
                                            />
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <Share2 className="h-12 w-12 text-muted-foreground" />
                                <h3 className="text-2xl font-bold tracking-tight">Ainda não criou nenhum croqui ou POI</h3>
                                <p className="text-muted-foreground">Crie um POI para guardar localizações importantes como clientes ou fornecedores.</p>
                                <Button className="mt-4" onClick={() => router.push('/?#report-croqui')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Novo
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {croquiToEdit && (
                <CroquiEditDialog
                    open={!!croquiToEdit}
                    onOpenChange={(isOpen) => !isOpen && setCroquiToEdit(null)}
                    croqui={croquiToEdit}
                    onSave={handleSaveChanges}
                />
            )}
        </>
    );
}

export default withAuth(MeusCroquisPage);
