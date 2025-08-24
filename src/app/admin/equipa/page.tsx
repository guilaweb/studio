
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Package, MapPin, PersonStanding, Send } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
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
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
];

// Mock Data - In a real app, this would come from a real-time database
const teamMembers = [
    { id: 1, name: "João Silva", status: "Em Rota", location: { lat: -8.82, lng: 13.24 } },
    { id: 2, name: "Maria Santos", status: "Disponível", location: { lat: -8.84, lng: 13.22 } },
    { id: 3, name: "Carlos Mendes", status: "Em Rota", location: { lat: -8.85, lng: 13.26 } },
];

const unassignedTasks = [
    { id: 'task-1', title: "Entrega Cliente A", location: { lat: -8.835, lng: 13.23 } },
    { id: 'task-2', title: "Recolha Fornecedor B", location: { lat: -8.81, lng: 13.25 } },
    { id: 'task-3', title: "Vistoria Técnica PT-123", location: { lat: -8.86, lng: 13.21 } },
];


function TeamManagementPage() {

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
                                <CardDescription>Localização e estado dos técnicos no terreno.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-2 rounded-md border bg-background">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-primary"/>
                                            <div>
                                                <p className="font-semibold text-sm">{member.name}</p>
                                                <Badge variant={member.status === 'Disponível' ? 'default' : 'secondary'} className={member.status === 'Disponível' ? 'bg-green-500' : ''}>
                                                    {member.status}
                                                </Badge>
                                            </div>
                                        </div>
                                         <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Tarefas Não Atribuídas</CardTitle>
                                <CardDescription>Arraste uma tarefa para um membro da equipa no mapa para a atribuir.</CardDescription>
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
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card className="h-[calc(100vh-10rem)]">
                             <Map
                                mapId="team-management-map"
                                defaultCenter={{ lat: -8.83, lng: 13.24 }}
                                defaultZoom={13}
                                gestureHandling={'greedy'}
                                disableDefaultUI={true}
                                styles={mapStyles}
                            >
                               {teamMembers.map(member => (
                                   <AdvancedMarker key={member.id} position={member.location} title={member.name}>
                                        <Pin background={'#10B981'} borderColor={'#059669'} glyphColor={'#ffffff'}>
                                            <PersonStanding />
                                        </Pin>
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
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(TeamManagementPage, ['Agente Municipal', 'Administrador']);
