
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Package, MapPin, PersonStanding, Send, Phone, MessageSquare, X, Car, ListTodo, Check, Search } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Badge } from "@/components/ui/badge";
import { TeamMemberMarker } from "@/components/team-management/team-member-marker";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
];

const teamMembers = [
    { 
        id: 1, 
        name: "João Silva", 
        status: 'Em Rota' as const, 
        location: { lat: -8.82, lng: 13.24 }, 
        photoURL: 'https://placehold.co/40x40.png',
        employeeId: 'TEC-001',
        team: 'Eletricidade',
        vehicle: { type: 'Carrinha de Manutenção', plate: 'LD-01-02-AA' },
        currentTask: { id: 'task-4', title: 'Verificar PT-456' },
        taskQueue: [
            { id: 'task-5', title: 'Reparar semáforo Cruzamento X' },
            { id: 'task-6', title: 'Inspeção de rotina Y' }
        ],
        stats: { completed: 3, avgTime: '35 min' }
    },
    { 
        id: 2, 
        name: "Maria Santos", 
        status: 'Disponível' as const, 
        location: { lat: -8.84, lng: 13.22 }, 
        photoURL: 'https://placehold.co/40x40.png',
        employeeId: 'TEC-002',
        team: 'Saneamento',
        vehicle: { type: 'Motorizada de Intervenção Rápida', plate: 'LD-03-04-BB' },
        currentTask: null,
        taskQueue: [],
        stats: { completed: 5, avgTime: '25 min' }
    },
    { 
        id: 3, 
        name: "Carlos Mendes", 
        status: 'Ocupado' as const, 
        location: { lat: -8.85, lng: 13.26 }, 
        photoURL: null,
        employeeId: 'TEC-003',
        team: 'Saneamento',
        vehicle: { type: 'Carrinha de Manutenção', plate: 'LD-05-06-CC' },
        currentTask: { id: 'task-7', title: 'Reparar fuga de água na Rua Z' },
        taskQueue: [],
        stats: { completed: 2, avgTime: '75 min' }
    },
    { 
        id: 4, 
        name: "Ana Pereira", 
        status: 'Offline' as const, 
        location: { lat: -8.83, lng: 13.21 }, 
        photoURL: 'https://placehold.co/40x40.png',
        employeeId: 'TEC-004',
        team: 'Eletricidade',
        vehicle: null,
        currentTask: null,
        taskQueue: [],
        stats: { completed: 0, avgTime: 'N/A' }
    },
];

const unassignedTasks = [
    { id: 'task-1', title: "Entrega Cliente A", location: { lat: -8.835, lng: 13.23 } },
    { id: 'task-2', title: "Recolha Fornecedor B", location: { lat: -8.81, lng: 13.25 } },
    { id: 'task-3', title: "Vistoria Técnica PT-123", location: { lat: -8.86, lng: 13.21 } },
];

type StatusFilter = 'Todos' | 'Disponível' | 'Em Rota' | 'Ocupado' | 'Offline';


function TeamManagementPage() {
    const [selectedMember, setSelectedMember] = React.useState<(typeof teamMembers)[0] | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('Todos');
    const [teamFilter, setTeamFilter] = React.useState('Todos');
    
    const statusBadgeVariant = (status: string) => {
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
            const nameMatch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
            const statusMatch = statusFilter === 'Todos' || member.status === statusFilter;
            const teamMatch = teamFilter === 'Todos' || member.team === teamFilter;
            return nameMatch && statusMatch && teamMatch;
        });
    }, [searchQuery, statusFilter, teamFilter]);

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
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
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
                                            </SelectContent>
                                        </Select>
                                     </div>
                                </div>
                                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                    {filteredMembers.map(member => (
                                        <div key={member.id} className={cn("flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-muted", selectedMember?.id === member.id ? 'bg-primary/10 border-primary' : 'bg-background')} onClick={() => setSelectedMember(member)}>
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-primary"/>
                                                <div>
                                                    <p className="font-semibold text-sm">{member.name}</p>
                                                    <Badge variant="secondary" className={statusBadgeVariant(member.status)}>
                                                        {member.status}
                                                    </Badge>
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
                                <CardDescription>Arraste uma tarefa para um membro no mapa.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                               {unassignedTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-2 rounded-md border bg-background cursor-grab active:cursor-grabbing">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-muted-foreground"/>
                                            <p className="font-semibold text-sm">{task.title}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Send className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className={`transition-all duration-300 ${selectedMember ? 'md:col-span-2' : 'md:col-span-3'}`}>
                             <Card className="h-[calc(100vh-10rem)]">
                                <Map
                                    mapId="team-management-map"
                                    defaultCenter={{ lat: -8.83, lng: 13.24 }}
                                    defaultZoom={13}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                    styles={mapStyles}
                                >
                                {filteredMembers.map(member => (
                                    <AdvancedMarker key={member.id} position={member.location} title={member.name} onClick={() => setSelectedMember(member)}>
                                        <TeamMemberMarker 
                                                name={member.name}
                                                photoURL={member.photoURL}
                                                status={member.status}
                                            />
                                    </AdvancedMarker>
                                ))}
                                {unassignedTasks.map(task => (
                                        <AdvancedMarker key={task.id} position={task.location} title={task.title}>
                                            <Pin background={'#F97316'} borderColor={'#EA580C'} glyphColor={'#ffffff'}>
                                                <Package />
                                            </Pin>
                                    </AdvancedMarker>
                                ))}
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
                                                    <AvatarImage src={selectedMember.photoURL || undefined} alt={selectedMember.name} />
                                                    <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-lg">{selectedMember.name}</CardTitle>
                                                    <CardDescription>ID: {selectedMember.employeeId}</CardDescription>
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
                                            <h4 className="font-semibold text-xs text-muted-foreground">Fila de Tarefas ({selectedMember.taskQueue.length})</h4>
                                             <div className="space-y-1">
                                                {selectedMember.taskQueue.length > 0 ? selectedMember.taskQueue.map(task => (
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
                                                <p className="text-xs">{selectedMember.stats.completed} tarefas concluídas</p>
                                            </div>
                                         </div>
                                         <Separator />
                                        <div className="flex gap-2 pt-2">
                                            <Button variant="outline" size="sm" className="flex-1"><Phone className="mr-2 h-4 w-4" /> Ligar</Button>
                                            <Button variant="outline" size="sm" className="flex-1"><MessageSquare className="mr-2 h-4 w-4" /> Mensagem</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(TeamManagementPage, ['Agente Municipal', 'Administrador']);
