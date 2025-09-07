

"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Package, MapPin, PersonStanding, Send, Phone, MessageSquare, X, Car, ListTodo, Check, Search, Loader2, Truck, AlertTriangle, Wrench, Fuel, Info } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Badge } from "@/components/ui/badge";
import { TeamMemberMarker } from "@/components/team-management/team-member-marker";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import TeamMemberPath from "@/components/team-management/team-member-path";
import { useUsers } from "@/services/user-service";
import { PointOfInterest, SuggestTechnicianOutput, UserProfile } from "@/lib/data";
import { usePoints } from "@/hooks/use-points";
import { useToast } from "@/hooks/use-toast";
import { suggestTechnicianFlow } from "@/ai/flows/suggest-technician-flow";
import { SuggestionBadge } from "@/components/team-management/suggestion-badge";
import DashboardClusterer from "@/components/dashboard/dashboard-clusterer";
import RecentAlerts, { Alert } from "@/components/team-management/recent-alerts";
import { useFuelEntries } from "@/services/fuel-service";
import { useMaintenancePlans } from "@/services/maintenance-service";
import { differenceInDays, addMonths } from "date-fns";

type StatusFilter = 'Todos' | 'Disponível' | 'Em Rota' | 'Ocupado' | 'Offline';


function TeamManagementPage() {
    const { users, loading: loadingUsers, updateUserProfile } = useUsers();
    const { allData: allPoints, loading: loadingPoints, addPoint } = usePoints();
    const { fuelEntries, loading: loadingFuel } = useFuelEntries();
    const { maintenancePlans, loading: loadingPlans } = useMaintenancePlans();
    const [selectedMember, setSelectedMember] = React.useState<UserProfile | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('Todos');
    const [teamFilter, setTeamFilter] = React.useState('Todos');
    const [localTasks, setLocalTasks] = React.useState<PointOfInterest[]>([]);
    const [suggestedTechnicians, setSuggestedTechnicians] = React.useState<SuggestTechnicianOutput['suggestions']>([]);
    const [isSuggesting, setIsSuggesting] = React.useState<string | null>(null); // Holds the ID of the task being analyzed
    const { toast } = useToast();
    const { user: currentUser, profile: currentProfile } = useAuth();


    // Filter for technicians from the user list
    const teamMembers = React.useMemo(() => {
        return users.filter(u => u.role === 'Agente Municipal');
    }, [users]);
    
    // Filter for unassigned tasks from the points list
    React.useEffect(() => {
        const unassigned = allPoints.filter(p => (p.type === 'incident' || p.type === 'sanitation') && (p.status === 'unknown' || p.status === 'full' || p.status === 'in_progress' === false));
        setLocalTasks(unassigned);
    }, [allPoints]);


    const statusBadgeVariant = (status?: string) => {
        if(!status) return 'secondary';
        switch(status) {
            case 'Disponível': return 'bg-green-500';
            case 'Em Rota': return 'bg-orange-500';
            case 'Ocupado': return 'bg-red-500';
            case 'Offline': return 'bg-gray-400';
            default: return 'secondary';
        }
    }
    
    const filteredMembers = React.useMemo(() => {
        return teamMembers.filter(member => {
            const nameMatch = member.displayName.toLowerCase().includes(searchQuery.toLowerCase());
            const statusMatch = statusFilter === 'Todos' || member.status === statusFilter;
            const teamMatch = teamFilter === 'Todos' || member.team === teamMatch;
            return nameMatch && statusMatch && teamMatch;
        });
    }, [teamMembers, searchQuery, statusFilter, teamFilter]);

    const kpis = React.useMemo(() => {
        const total = teamMembers.length;
        const emRota = teamMembers.filter(m => m.status === 'Em Rota').length;
        const disponivel = teamMembers.filter(m => m.status === 'Disponível').length;
        const ocupado = teamMembers.filter(m => m.status === 'Ocupado').length;
        return { total, emRota, disponivel, ocupado };
    }, [teamMembers]);

    const fleetConsumption = React.useMemo(() => {
        if (!fuelEntries || fuelEntries.length < 2) return 'N/A';

        const consumptions: number[] = [];
        const entriesByVehicle = fuelEntries.reduce((acc, entry) => {
            if (!acc[entry.vehicleId]) {
                acc[entry.vehicleId] = [];
            }
            acc[entry.vehicleId].push(entry);
            return acc;
        }, {} as Record<string, typeof fuelEntries>);
        
        for (const vehicleId in entriesByVehicle) {
            const vehicleEntries = entriesByVehicle[vehicleId].sort((a,b) => a.odometer - b.odometer);
            for (let i = 1; i < vehicleEntries.length; i++) {
                const prevEntry = vehicleEntries[i-1];
                const currentEntry = vehicleEntries[i];
                const distance = currentEntry.odometer - prevEntry.odometer;
                // Use the liters from the *previous* fill-up to calculate consumption for the distance traveled.
                if (distance > 0 && prevEntry.liters > 0) {
                    consumptions.push(distance / prevEntry.liters);
                }
            }
        }
        
        if (consumptions.length === 0) return 'N/A';
        const avgConsumption = consumptions.reduce((acc, c) => acc + c, 0) / consumptions.length;
        return `${avgConsumption.toFixed(2)} km/L`;

    }, [fuelEntries]);
    
    const maintenanceAlerts = React.useMemo(() => {
        const alerts: Alert[] = [];
        const now = new Date();

        teamMembers.forEach(member => {
            if (!member.vehicle || !member.vehicle.maintenancePlanIds) return;

            member.vehicle.maintenancePlanIds.forEach(planId => {
                const plan = maintenancePlans.find(p => p.id === planId);
                if (!plan) return;
                
                let isDue = false;
                let dueDateInfo = '';

                if (plan.type === 'distance' && member.vehicle.odometer && member.vehicle.lastServiceOdometer) {
                    const nextServiceOdometer = member.vehicle.lastServiceOdometer + plan.interval;
                    const kmRemaining = nextServiceOdometer - member.vehicle.odometer;
                    if (kmRemaining <= 1000) { 
                        isDue = true;
                        dueDateInfo = `vence em ${kmRemaining > 0 ? kmRemaining : 0} km`;
                    }
                } else if (plan.type === 'time' && member.vehicle.lastServiceDate) {
                    const lastServiceDate = new Date(member.vehicle.lastServiceDate);
                    const nextServiceDate = addMonths(lastServiceDate, plan.interval);
                    const daysRemaining = differenceInDays(nextServiceDate, now);
                    if (daysRemaining <= 7) { 
                        isDue = true;
                        dueDateInfo = `vence em ${daysRemaining > 0 ? daysRemaining : 0} dias`;
                    }
                }

                if (isDue) {
                    const maintenanceId = `${member.uid}-${plan.id}`;
                    // Check if a task for this maintenance already exists
                    const taskExists = allPoints.some(p => p.maintenanceId === maintenanceId && p.status !== 'collected');

                    if (!taskExists) {
                         const newTask = {
                            id: `maintenance-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,
                            maintenanceId: maintenanceId,
                            type: 'incident' as const,
                            title: `Manutenção: ${plan.name} - ${member.vehicle!.plate}`,
                            description: `Manutenção preventiva "${plan.name}" necessária para o veículo ${member.vehicle!.plate}. ${dueDateInfo}.`,
                            position: member.location || { lat: -8.83, lng: 13.23 }, // Fallback position
                            authorId: currentUser!.uid,
                            authorDisplayName: currentProfile!.displayName,
                            lastReported: new Date().toISOString(),
                            status: 'unknown' as const,
                            priority: 'medium' as const,
                            updates: [{
                                id: `update-${Date.now()}`,
                                text: `Ordem de serviço gerada automaticamente pelo sistema de manutenção preventiva.`,
                                authorId: currentUser!.uid,
                                authorDisplayName: 'Sistema MUNITU',
                                timestamp: new Date().toISOString()
                            }]
                        };
                        addPoint(newTask as any);
                    }
                    
                    alerts.push({
                        id: maintenanceId,
                        time: now.toISOString(),
                        description: `Manutenção "${plan.name}" para ${member.vehicle!.plate} ${dueDateInfo}.`,
                        level: 'warning',
                    });
                }
            });
        });
        
        const staticAlerts: Alert[] = [
            { id: '1', time: '10:32', description: 'Veículo LD-01-00-AA excedeu 100 km/h na EN-100.', level: 'critical' },
            { id: '2', time: '10:15', description: 'Motorista Demonstração Silva acionou o botão de pânico.', level: 'critical' },
            { id: '3', time: '09:45', description: "Veículo LD-03-00-AC entrou na zona 'Centro da Cidade'.", level: 'info' },
        ];
        
        return [...alerts, ...staticAlerts].sort((a,b) => {
            const levelOrder = { critical: 0, warning: 1, info: 2 };
            return levelOrder[a.level] - levelOrder[b.level];
        });
    }, [teamMembers, maintenancePlans, allPoints, addPoint, currentUser, currentProfile]);
    
    const upcomingMaintenanceCount = React.useMemo(() => {
        return maintenanceAlerts.filter(a => a.level === 'warning' || a.level === 'critical').length;
    }, [maintenanceAlerts]);

    const handleAssignTask = (task: PointOfInterest) => {
        if (!suggestedTechnicians.length) {
            toast({
                variant: 'destructive',
                title: 'Sem Sugestões Ativas',
                description: 'Por favor, selecione uma tarefa primeiro para obter sugestões de técnicos.',
            });
            return;
        }
        const topSuggestion = suggestedTechnicians.find(s => s.rank === 1);
        if (!topSuggestion) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi encontrada uma sugestão principal.'});
            return;
        }

        const technicianToAssign = teamMembers.find(t => t.uid === topSuggestion.technicianId);
        if (!technicianToAssign) {
             toast({ variant: 'destructive', title: 'Erro', description: 'O técnico sugerido não foi encontrado.'});
            return;
        }

        const updatedTechnician: Partial<UserProfile> = {
            status: 'Ocupado',
            taskQueue: [...(technicianToAssign.taskQueue || []), task],
        };
        
        updateUserProfile(technicianToAssign.uid, updatedTechnician);

        // Remove task from local list of unassigned tasks
        setLocalTasks(prev => prev.filter(t => t.id !== task.id));
        setSuggestedTechnicians([]); // Clear suggestions after assignment
        setIsSuggesting(null);

        toast({
            title: 'Tarefa Atribuída!',
            description: `A tarefa "${task.title}" foi atribuída a ${technicianToAssign.displayName}.`,
        });
    };
    
    const handleTaskSelect = async (task: PointOfInterest) => {
        setIsSuggesting(task.id);
        setSuggestedTechnicians([]); // Clear previous suggestions
        try {
            const result = await suggestTechnicianFlow({
                task: {
                    id: task.id,
                    title: task.title,
                    location: task.position
                },
                technicians: teamMembers.map(t => ({
                    id: t.uid,
                    name: t.displayName,
                    location: t.location!,
                    status: t.status!,
                    skills: t.skills || [],
                    taskQueueSize: t.taskQueue?.length || 0,
                }))
            });
            setSuggestedTechnicians(result.suggestions);
            if(result.suggestions.length === 0) {
                toast({ title: 'Nenhum técnico adequado encontrado.', description: 'Todos os técnicos podem estar ocupados ou offline.'})
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Erro na Sugestão', description: 'Não foi possível obter sugestões da IA.'})
        } finally {
            setIsSuggesting(null);
        }
    }
    
    const handleMarkerDragEnd = (memberId: string, event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return;
        const newLocation = event.latLng.toJSON();
        updateUserProfile(memberId, { location: newLocation });
    };


     if (loadingUsers || loadingPoints || loadingFuel || loadingPlans) {
        return <div>A carregar dados da equipa...</div>;
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
                        Gestão de Equipa e Despacho
                    </h1>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-4">
                     <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Veículos em Rota</CardTitle><Truck className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{kpis.emRota}</div><p className="text-xs text-muted-foreground">de {kpis.total} veículos totais</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Alertas do Dia</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{maintenanceAlerts.filter(a => a.level === 'critical').length}</div><p className="text-xs text-muted-foreground">{maintenanceAlerts.length} alertas no total</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Manutenções</CardTitle><Wrench className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{upcomingMaintenanceCount}</div><p className="text-xs text-muted-foreground">Vencem esta semana</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Consumo Médio</CardTitle><Fuel className="h-4 w-4 text-muted-foreground"/></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{fleetConsumption}</div><p className="text-xs text-muted-foreground">Média da frota</p></CardContent>
                        </Card>
                    </div>

                    <div className="grid flex-1 items-start gap-4 md:grid-cols-3 lg:grid-cols-4">
                        <div className="md:col-span-1 lg:col-span-1 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Equipa Ativa</CardTitle>
                                    <CardDescription>Localização e estado dos técnicos.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Pesquisar por nome..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Filtrar por estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Todos">Todos os Estados</SelectItem>
                                                    <SelectItem value="Disponível">Disponível</SelectItem>
                                                    <SelectItem value="Em Rota">Em Rota</SelectItem>
                                                    <SelectItem value="Ocupado">Ocupado</SelectItem>
                                                    <SelectItem value="Offline">Offline</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={teamFilter} onValueChange={setTeamFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Filtrar por equipa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Todos">Todas as Equipas</SelectItem>
                                                    <SelectItem value="Saneamento">Saneamento</SelectItem>
                                                    <SelectItem value="Eletricidade">Eletricidade</SelectItem>
                                                    <SelectItem value="Geral">Geral</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                        {filteredMembers.map(member => (
                                            <div key={member.uid} className={cn("flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-muted", selectedMember?.uid === member.uid ? 'bg-primary/10 border-primary' : 'bg-background')} onClick={() => setSelectedMember(member)}>
                                                <div className="flex items-center gap-3">
                                                    <TeamMemberMarker {...member} />
                                                    <div>
                                                        <p className="font-semibold text-sm">{member.displayName}</p>
                                                        {member.status && (
                                                            <Badge variant="secondary" className={statusBadgeVariant(member.status)}>
                                                                {member.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tarefas Não Atribuídas</CardTitle>
                                    <CardDescription>Clique numa tarefa para ver sugestões.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-[30vh] overflow-auto">
                                {localTasks.map(task => (
                                        <div key={task.id} className="flex items-center justify-between p-2 rounded-md border bg-background cursor-grab active:cursor-grabbing hover:bg-muted" onClick={() => handleTaskSelect(task)}>
                                            <div className="flex items-center gap-3">
                                                {isSuggesting === task.id ? <Loader2 className="h-5 w-5 text-muted-foreground animate-spin"/> : <Package className="h-5 w-5 text-muted-foreground"/>}
                                                <p className="font-semibold text-sm">{task.title}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleAssignTask(task); }}>
                                                <Send className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <RecentAlerts alerts={maintenanceAlerts} />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`transition-all duration-300 ${selectedMember ? 'md:col-span-2' : 'md:col-span-3'}`}>
                                <Card className="h-[calc(100vh-16rem)]">
                                    <Map
                                        mapId="team-management-map"
                                        defaultCenter={{ lat: -12.5, lng: 18.5 }}
                                        defaultZoom={6}
                                        gestureHandling={'greedy'}
                                        disableDefaultUI={true}
                                    >
                                        <DashboardClusterer points={filteredMembers.map(m => ({...m, type: 'atm'}))} />
                                        {localTasks.map(task => (
                                                <AdvancedMarker key={task.id} position={task.position} title={task.title} onClick={() => handleTaskSelect(task)}>
                                                    <Pin background={'#F97316'} borderColor={'#EA580C'} glyphColor={'#ffffff'}>
                                                        <Package />
                                                    </Pin>
                                            </AdvancedMarker>
                                        ))}
                                        {selectedMember && selectedMember.path && <TeamMemberPath path={selectedMember.path} color="#22c55e" />}
                                        {selectedMember && selectedMember.currentTask && selectedMember.currentTask.path && <TeamMemberPath path={selectedMember.currentTask.path} color="#3b82f6" />}
                                    </Map>
                                </Card>
                            </div>
                            {selectedMember && (
                                <div className="md:col-span-1 space-y-4 animate-in fade-in-50">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={selectedMember.photoURL || undefined} alt={selectedMember.displayName} />
                                                        <AvatarFallback>{selectedMember.displayName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-lg">{selectedMember.displayName}</CardTitle>
                                                        <CardDescription>ID: {selectedMember.uid}</CardDescription>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedMember(null)}><X className="h-4 w-4" /></Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 text-sm">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-xs text-muted-foreground">Tarefa Atual</h4>
                                                {selectedMember.currentTask ? (
                                                    <p className="font-medium p-2 bg-muted rounded-md">{selectedMember.currentTask.title}</p>
                                                ) : (
                                                    <p className="text-muted-foreground p-2 bg-muted rounded-md">Nenhuma tarefa ativa.</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-xs text-muted-foreground">Fila de Tarefas ({selectedMember.taskQueue?.length || 0})</h4>
                                                <div className="space-y-1">
                                                    {selectedMember.taskQueue && selectedMember.taskQueue.length > 0 ? selectedMember.taskQueue.map(task => (
                                                        <div key={task.id} className="flex items-center gap-2 p-1.5 rounded bg-muted">
                                                            <ListTodo className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-xs">{task.title}</span>
                                                        </div>
                                                    )) : <p className="text-xs text-muted-foreground">Fila vazia.</p>}
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-xs text-muted-foreground">Veículo</h4>
                                                {selectedMember.vehicle ? (
                                                    <div className="flex items-center gap-2">
                                                    <Car className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium text-xs">{selectedMember.vehicle.type}</p>
                                                        <p className="text-xs text-muted-foreground">{selectedMember.vehicle.plate}</p>
                                                    </div>
                                                    </div>
                                                ) : <p className="text-xs text-muted-foreground">Nenhum veículo atribuído.</p>}
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-xs text-muted-foreground">Desempenho (Hoje)</h4>
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-xs">{selectedMember.stats?.completed || 0} tarefas concluídas</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                                    <a href={`tel:${selectedMember.phoneNumber}`}>
                                                        <Phone className="mr-2 h-4 w-4" /> Ligar
                                                    </a>
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                                    <a href={`https://wa.me/${selectedMember.phoneNumber}`} target="_blank" rel="noopener noreferrer">
                                                        <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                                                    </a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(TeamManagementPage, ['Agente Municipal', 'Administrador']);

    





