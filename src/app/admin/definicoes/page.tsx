
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Landmark, Construction, Siren, Trash, Droplet, Square, Megaphone, EyeOff, Eye, Globe, Plus, Loader2, Trash2 } from "lucide-react";
import { usePublicLayerSettings, updatePublicLayerSettings } from "@/services/settings-service";
import type { ActiveLayers, Layer } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useExternalLayers, addExternalLayer, deleteExternalLayer, updateExternalLayerVisibility } from "@/services/external-layers-service";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExternalLayer } from "@/services/external-layers-service";

const layerConfig = [
  { id: "atm", label: "Caixas Eletrônicos", Icon: Landmark },
  { id: "incident", label: "Incidentes", Icon: Siren },
  { id: "sanitation", label: "Saneamento", Icon: Trash },
  { id: "construction", label: "Obras e Projetos", Icon: Construction },
  { id: "announcement", label: "Anúncios", Icon: Megaphone },
  { id: "water", label: "Rede de Água", Icon: Droplet },
  { id: "land_plot", label: "Lotes de Terreno", Icon: Square },
];

function AdminSettingsPage() {
    const { publicLayers, loading: loadingPublicLayers } = usePublicLayerSettings();
    const [localLayers, setLocalLayers] = React.useState<ActiveLayers | null>(null);
    const { externalLayers, loading: loadingExternalLayers } = useExternalLayers();
    const [newLayerName, setNewLayerName] = React.useState("");
    const [newLayerUrl, setNewLayerUrl] = React.useState("");
    const [newLayerType, setNewLayerType] = React.useState<ExternalLayer['type']>('wms');
    const [newLayerServiceName, setNewLayerServiceName] = React.useState("");
    const [isAddingLayer, setIsAddingLayer] = React.useState(false);
    const [layerToDelete, setLayerToDelete] = React.useState<string | null>(null);
    const { toast } = useToast();
    
    React.useEffect(() => {
        if (!loadingPublicLayers && publicLayers) {
            setLocalLayers(publicLayers);
        }
    }, [publicLayers, loadingPublicLayers]);

    const handleTogglePublicLayer = async (layerId: Layer) => {
        if (!localLayers) return;

        const newLayers = {
            ...localLayers,
            [layerId]: !localLayers[layerId],
        };
        setLocalLayers(newLayers);

        try {
            await updatePublicLayerSettings(newLayers);
            toast({
                title: "Definição Atualizada",
                description: `A visibilidade da camada "${layerConfig.find(l => l.id === layerId)?.label}" foi alterada.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao Atualizar",
                description: "Não foi possível guardar a alteração.",
            });
            // Revert local state on error
            setLocalLayers(publicLayers);
        }
    };
    
    const handleAddExternalLayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLayerName || !newLayerUrl || !newLayerServiceName) {
            toast({ variant: "destructive", title: "Dados em falta", description: "Preencha todos os campos da camada externa."});
            return;
        }
        setIsAddingLayer(true);
        try {
            await addExternalLayer(newLayerName, newLayerUrl, newLayerType, newLayerServiceName);
            toast({ title: "Camada Adicionada", description: `A camada "${newLayerName}" foi adicionada com sucesso.`});
            setNewLayerName("");
            setNewLayerUrl("");
            setNewLayerServiceName("");
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao Adicionar", description: "Não foi possível adicionar a camada externa."});
        } finally {
            setIsAddingLayer(false);
        }
    }
    
    const handleToggleExternalLayer = async (id: string, visible: boolean) => {
        try {
            await updateExternalLayerVisibility(id, visible);
            toast({ title: "Visibilidade Atualizada"});
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível alterar a visibilidade."});
        }
    };
    
    const handleDeleteLayer = async () => {
        if (!layerToDelete) return;
        try {
            await deleteExternalLayer(layerToDelete);
            toast({ title: "Camada Removida"});
            setLayerToDelete(null);
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover a camada."});
        }
    };


    if (loadingPublicLayers || !localLayers || loadingExternalLayers) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40 p-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                 <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Definições da Plataforma
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visibilidade Pública das Camadas</CardTitle>
                            <CardDescription>
                                Controle quais camadas de informação são visíveis para os utilizadores com o perfil "Cidadao".
                                As alterações são guardadas automaticamente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {layerConfig.map(({ id, label, Icon }) => (
                                <div key={id} className="flex items-center justify-between rounded-lg border p-4">
                                    <Label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{label}</span>
                                    </Label>
                                    <div className="flex items-center gap-2">
                                         <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            {localLayers[id as Layer] ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-500" />}
                                            {localLayers[id as Layer] ? 'Público' : 'Privado'}
                                         </span>
                                        <Switch
                                            id={id}
                                            checked={localLayers[id as Layer]}
                                            onCheckedChange={() => handleTogglePublicLayer(id as Layer)}
                                            aria-label={`Toggle ${label} layer`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão de Camadas Externas</CardTitle>
                            <CardDescription>
                                Adicione e gira camadas de dados provenientes de Web Services (WMS, WFS).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleAddExternalLayer} className="space-y-4 rounded-lg border p-4">
                                <h4 className="text-sm font-medium">Adicionar Nova Camada</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="new-layer-name">Nome da Camada (Apelido)</Label>
                                    <Input id="new-layer-name" value={newLayerName} onChange={(e) => setNewLayerName(e.target.value)} placeholder="Ex: Mapa de Uso do Solo 2024" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-layer-url">URL Base do Serviço</Label>
                                    <Input id="new-layer-url" value={newLayerUrl} onChange={(e) => setNewLayerUrl(e.target.value)} placeholder="https://..." />
                                </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-layer-type">Tipo de Serviço</Label>
                                        <Select value={newLayerType} onValueChange={(v) => setNewLayerType(v as any)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="wms">WMS (Imagem)</SelectItem>
                                                <SelectItem value="wfs">WFS (Dados)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-layer-service-name">Nome da Camada no Serviço</Label>
                                        <Input id="new-layer-service-name" value={newLayerServiceName} onChange={(e) => setNewLayerServiceName(e.target.value)} placeholder="Ex: munitu:uso_solo" />
                                    </div>
                                 </div>
                                <Button type="submit" disabled={isAddingLayer}>
                                    {isAddingLayer ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4"/>}
                                    Adicionar Camada
                                </Button>
                            </form>
                            
                            <div className="space-y-2">
                                {externalLayers.map(layer => (
                                    <div key={layer.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <span className="font-medium text-sm">{layer.name}</span>
                                                <p className="text-xs text-muted-foreground uppercase">{layer.type}</p>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <Switch
                                                checked={layer.visible}
                                                onCheckedChange={(checked) => handleToggleExternalLayer(layer.id, checked)}
                                                aria-label={`Toggle ${layer.name} layer`}
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setLayerToDelete(layer.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
             <DeleteConfirmationDialog 
                open={!!layerToDelete}
                onOpenChange={(open) => !open && setLayerToDelete(null)}
                onConfirm={handleDeleteLayer}
            />
        </>
    );
}

export default withAuth(AdminSettingsPage, ['Administrador']);
