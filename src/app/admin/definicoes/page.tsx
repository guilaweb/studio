
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Landmark, Construction, Siren, Trash, Droplet, Square, Megaphone, EyeOff, Eye, Globe, Plus, Loader2, Trash2, MapPin, Wrench, Fuel, CreditCard } from "lucide-react";
import { usePublicLayerSettings, updatePublicLayerSettings } from "@/services/settings-service";
import type { ActiveLayers, Layer, SubscriptionPlan } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useExternalLayers, addExternalLayer, deleteExternalLayer, updateExternalLayerVisibility } from "@/services/external-layers-service";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExternalLayer } from "@/services/external-layers-service";
import { useGeofences, deleteGeofence } from "@/services/geofence-service";
import type { Geofence } from "@/services/geofence-service";
import GeofenceEditorDialog from "@/components/geofence-editor-dialog";
import { useMaintenancePlans, addMaintenancePlan, deleteMaintenancePlan } from "@/services/maintenance-service";
import type { MaintenancePlan as MaintenancePlanType } from "@/services/maintenance-service";
import { APIProvider } from "@vis.gl/react-google-maps";
import PlanEditor from "@/components/admin/definicoes/plan-editor";
import { useSubscriptionPlans } from "@/services/plans-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AdminSettingsPage() {
    const { externalLayers, loading: loadingExternalLayers } = useExternalLayers();
    const { geofences, loading: loadingGeofences } = useGeofences();
    const { maintenancePlans, loading: loadingMaintenancePlans } = useMaintenancePlans();
    const { subscriptionPlans, loading: loadingPlans } = useSubscriptionPlans();

    
    // State for External Layers
    const [newLayerName, setNewLayerName] = React.useState("");
    const [newLayerUrl, setNewLayerUrl] = React.useState("");
    const [newLayerType, setNewLayerType] = React.useState<ExternalLayer['type']>('wms');
    const [newLayerServiceName, setNewLayerServiceName] = React.useState("");
    const [isAddingLayer, setIsAddingLayer] = React.useState(false);
    const [layerToDelete, setLayerToDelete] = React.useState<string | null>(null);

    // State for Geofences
    const [isGeofenceEditorOpen, setIsGeofenceEditorOpen] = React.useState(false);
    const [geofenceToEdit, setGeofenceToEdit] = React.useState<Geofence | null>(null);
    const [geofenceToDelete, setGeofenceToDelete] = React.useState<string | null>(null);
    
    // State for Maintenance Plans
    const [newPlanName, setNewPlanName] = React.useState("");
    const [newPlanType, setNewPlanType] = React.useState<MaintenancePlanType['type']>('distance');
    const [newPlanInterval, setNewPlanInterval] = React.useState<number | "">("");
    const [isAddingPlan, setIsAddingPlan] = React.useState(false);
    const [planToDelete, setPlanToDelete] = React.useState<string | null>(null);
    
    const [planToEdit, setPlanToEdit] = React.useState<SubscriptionPlan | null>(null);
    const [isPlanEditorOpen, setIsPlanEditorOpen] = React.useState(false);

    
    const { toast } = useToast();
    
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
    
    const handleOpenGeofenceEditor = (geofence: Geofence | null) => {
        setGeofenceToEdit(geofence);
        setIsGeofenceEditorOpen(true);
    };

    const handleDeleteGeofence = async () => {
        if (!geofenceToDelete) return;
        try {
            await deleteGeofence(geofenceToDelete);
            toast({ title: "Cerca Virtual Removida"});
            setGeofenceToDelete(null);
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover a cerca virtual."});
        }
    }

    const handleAddMaintenancePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlanName || !newPlanInterval) {
            toast({ variant: "destructive", title: "Dados em falta", description: "Preencha o nome e o intervalo do plano."});
            return;
        }
        setIsAddingPlan(true);
        try {
            await addMaintenancePlan(newPlanName, newPlanType, Number(newPlanInterval));
            toast({ title: "Plano Adicionado", description: `O plano "${newPlanName}" foi adicionado com sucesso.`});
            setNewPlanName("");
            setNewPlanInterval("");
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao Adicionar", description: "Não foi possível adicionar o plano."});
        } finally {
            setIsAddingPlan(false);
        }
    };
    
    const handleDeletePlan = async () => {
        if (!planToDelete) return;
        try {
            await deleteMaintenancePlan(planToDelete);
            toast({ title: "Plano Removido"});
            setPlanToDelete(null);
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o plano."});
        }
    };

    const getThingToDelete = () => {
        if (layerToDelete) return { type: 'Camada Externa', action: handleDeleteLayer };
        if (geofenceToDelete) return { type: 'Cerca Virtual', action: handleDeleteGeofence };
        if (planToDelete) return { type: 'Plano de Manutenção', action: handleDeletePlan };
        return null;
    }
    const thingToDelete = getThingToDelete();
    
    const handleEditPlan = (plan: SubscriptionPlan) => {
        setPlanToEdit(plan);
        setIsPlanEditorOpen(true);
    }
    
    const handleAddNewPlan = () => {
        setPlanToEdit(null);
        setIsPlanEditorOpen(true);
    }

    if (loadingExternalLayers || loadingGeofences || loadingMaintenancePlans || loadingPlans) {
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
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
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
                <main className="flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6">
                    <Tabs defaultValue="maintenance">
                        <TabsList>
                            <TabsTrigger value="maintenance">Manutenção da Frota</TabsTrigger>
                            <TabsTrigger value="gis">Camadas GIS</TabsTrigger>
                            <TabsTrigger value="geofencing">Cercas Virtuais</TabsTrigger>
                            <TabsTrigger value="subscription">Planos SaaS</TabsTrigger>
                        </TabsList>
                        <TabsContent value="maintenance" className="mt-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Planos de Manutenção Preventiva</CardTitle>
                                    <CardDescription>Crie planos de manutenção baseados em distância ou tempo para a sua frota.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <form onSubmit={handleAddMaintenancePlan} className="space-y-4 rounded-lg border p-4">
                                        <h4 className="text-sm font-medium">Adicionar Novo Plano</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-plan-name">Nome do Plano</Label>
                                            <Input id="new-plan-name" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="Ex: Troca de Óleo" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-plan-type">Tipo de Intervalo</Label>
                                                <Select value={newPlanType} onValueChange={(v) => setNewPlanType(v as any)}>
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="distance">Distância (km)</SelectItem>
                                                        <SelectItem value="time">Tempo (meses)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-plan-interval">Intervalo</Label>
                                                <Input id="new-plan-interval" type="number" value={newPlanInterval} onChange={(e) => setNewPlanInterval(e.target.value ? Number(e.target.value) : "")} placeholder={newPlanType === 'distance' ? "10000" : "6"} />
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={isAddingPlan}>
                                            {isAddingPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4"/>}
                                            Adicionar Plano
                                        </Button>
                                    </form>
                                    <div className="space-y-2">
                                        {maintenancePlans.map(plan => (
                                            <div key={plan.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="flex items-center gap-3">
                                                    <Wrench className="h-5 w-5 text-muted-foreground" />
                                                    <span className="font-medium text-sm">{plan.name}</span>
                                                    <span className="text-xs text-muted-foreground">({plan.interval} {plan.type === 'distance' ? 'km' : 'meses'})</span>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setPlanToDelete(plan.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {maintenancePlans.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum plano de manutenção criado.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="gis" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gestão de Camadas Externas (GIS)</CardTitle>
                                    <CardDescription>Adicione e gira camadas de dados de Web Services (WMS, WFS).</CardDescription>
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
                                                        <SelectItem value="wmts">WMTS (Mosaico)</SelectItem>
                                                        <SelectItem value="wfs">WFS (Vetorial)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-layer-service-name">Nome no Serviço</Label>
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
                        </TabsContent>
                        <TabsContent value="geofencing" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gestão de Cercas Virtuais (Geofencing)</CardTitle>
                                    <CardDescription>Crie e gira áreas no mapa para monitorizar a entrada e saída de veículos.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button onClick={() => handleOpenGeofenceEditor(null)}>
                                        <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Cerca
                                    </Button>
                                    <div className="space-y-2">
                                        {geofences.map(geofence => (
                                            <div key={geofence.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                                    <span className="font-medium text-sm">{geofence.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenGeofenceEditor(geofence)}>Editar</Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setGeofenceToDelete(geofence.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {geofences.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma cerca virtual criada.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="subscription" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gestão de Planos de Subscrição</CardTitle>
                                    <CardDescription>Crie e edite os planos SaaS oferecidos na plataforma.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button onClick={handleAddNewPlan} className="w-full">
                                        <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Plano
                                    </Button>
                                    <div className="space-y-2">
                                        {subscriptionPlans.map(plan => (
                                            <div key={plan.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <span className="font-medium text-sm">{plan.name}</span>
                                                        <p className="text-xs text-muted-foreground">AOA {plan.price.toLocaleString()} / mês</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>Editar</Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
             <DeleteConfirmationDialog 
                open={!!thingToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setLayerToDelete(null);
                        setGeofenceToDelete(null);
                        setPlanToDelete(null);
                    }
                }}
                onConfirm={thingToDelete?.action || (() => {})}
                itemType={thingToDelete?.type || 'item'}
            />
            <GeofenceEditorDialog
                open={isGeofenceEditorOpen}
                onOpenChange={setIsGeofenceEditorOpen}
                geofenceToEdit={geofenceToEdit}
            />
            <PlanEditor
                open={isPlanEditorOpen}
                onOpenChange={setIsPlanEditorOpen}
                plan={planToEdit}
            />
        </APIProvider>
    );
}

export default withAuth(AdminSettingsPage, ['Administrador', 'Super Administrador']);

    