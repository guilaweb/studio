
"use client";

import * as React from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { withAuth } from "@/hooks/use-auth";

function ComunicacoesPage() {
    const { toast } = useToast();
    const [title, setTitle] = React.useState("");
    const [message, setMessage] = React.useState("");

    const handleSend = () => {
        if (!title || !message) {
            toast({
                variant: "destructive",
                title: "Campos em falta",
                description: "Por favor, preencha o título e a mensagem do anúncio.",
            });
            return;
        }

        // Simulate sending the announcement
        console.log("Sending announcement:", { title, message });

        toast({
            title: "Anúncio Enviado!",
            description: "A sua comunicação foi enviada para a área selecionada.",
        });

        // Reset form
        setTitle("");
        setMessage("");
    };
    
    const mapStyles: google.maps.MapTypeStyle[] = [
      { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
      { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
      { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
      { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
      { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    ];


    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
             <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar ao Mapa</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Comunicações Georreferenciadas
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Criar Anúncio</CardTitle>
                                <CardDescription>
                                    Escreva a sua mensagem e selecione a área no mapa para notificar os cidadãos.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título do Anúncio</Label>
                                    <Input 
                                        id="title" 
                                        placeholder="Ex: Corte de água programado" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Mensagem</Label>
                                    <Textarea 
                                        id="message"
                                        placeholder="Descreva o anúncio em detalhe..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                    />
                                </div>
                                <Button onClick={handleSend} className="w-full">
                                    Enviar Anúncio
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mapa de Seleção</CardTitle>
                                <CardDescription>
                                    Use o mapa para definir a área de abrangência do seu anúncio. (Funcionalidade de desenho a ser implementada).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[500px] p-0">
                                <Map
                                    defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                                    defaultZoom={12}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                    styles={mapStyles}
                                >
                                     {/* Future: Drawing tools will be added here */}
                                </Map>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(ComunicacoesPage);
