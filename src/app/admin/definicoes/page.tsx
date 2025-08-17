
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Landmark, Construction, Siren, Trash, Droplet, Square, Megaphone, EyeOff, Eye } from "lucide-react";
import { usePublicLayerSettings, updatePublicLayerSettings } from "@/services/settings-service";
import type { ActiveLayers, Layer } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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
    const { publicLayers, loading } = usePublicLayerSettings();
    const [localLayers, setLocalLayers] = React.useState<ActiveLayers | null>(null);
    const { toast } = useToast();
    
    React.useEffect(() => {
        if (!loading && publicLayers) {
            setLocalLayers(publicLayers);
        }
    }, [publicLayers, loading]);

    const handleToggle = async (layerId: Layer) => {
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


    if (loading || !localLayers) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40 p-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
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
            <main className="flex-1 p-4 sm:px-6 sm:py-6">
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
                                        onCheckedChange={() => handleToggle(id as Layer)}
                                        aria-label={`Toggle ${label} layer`}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(AdminSettingsPage, ['Agente Municipal', 'Administrador']);
