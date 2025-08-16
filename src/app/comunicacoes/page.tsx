
"use client";

import * as React from "react";
import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Trash2, Send, Loader2 } from "lucide-react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";

// Component to handle the drawing functionality on the map
const DrawingManager: React.FC<{ onPolygonComplete: (polygon: google.maps.Polygon) => void, clearTrigger: boolean }> = ({ onPolygonComplete, clearTrigger }) => {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = React.useState<google.maps.drawing.DrawingManager | null>(null);
    const [polygon, setPolygon] = React.useState<google.maps.Polygon | null>(null);

    React.useEffect(() => {
        if (!map || !drawing) return;

        const manager = new drawing.DrawingManager({
            drawingMode: drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
                fillColor: "hsl(var(--primary) / 0.2)",
                strokeColor: "hsl(var(--primary))",
                strokeWeight: 2,
                editable: true,
            },
        });
        
        setDrawingManager(manager);
        manager.setMap(map);
        
        const listener = manager.addListener('polygoncomplete', (poly: google.maps.Polygon) => {
            onPolygonComplete(poly);
            setPolygon(poly);
            manager.setDrawingMode(null); // Exit drawing mode
        });
        
        return () => {
            listener.remove();
            manager.setMap(null);
        };

    }, [map, drawing, onPolygonComplete]);

    const handleClearPolygon = () => {
        if (polygon) {
            polygon.setMap(null);
            setPolygon(null);
            if (drawingManager) {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            }
        }
    }
    
    React.useEffect(() => {
        if(clearTrigger) {
            handleClearPolygon();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clearTrigger])


    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            {polygon && (
                <Button onClick={handleClearPolygon} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Seleção
                </Button>
            )}
        </div>
    );
};


function ComunicacoesPage() {
    const { toast } = useToast();
    const { addPoint } = usePoints();
    const { user, profile } = useAuth();
    const [title, setTitle] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [drawnPolygon, setDrawnPolygon] = React.useState<google.maps.Polygon | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [clearPolygonTrigger, setClearPolygonTrigger] = React.useState(false);


    const handleSend = async () => {
        if (!title || !message) {
            toast({
                variant: "destructive",
                title: "Campos em falta",
                description: "Por favor, preencha o título e a mensagem do anúncio.",
            });
            return;
        }

        if (!drawnPolygon) {
             toast({
                variant: "destructive",
                title: "Área em falta",
                description: "Por favor, desenhe uma área no mapa para enviar a comunicação.",
            });
            return;
        }

        if (!user || !profile) {
            toast({ variant: "destructive", title: "Erro", description: "Precisa de estar autenticado para enviar um anúncio."});
            return;
        }
        
        setIsSubmitting(true);

        const path = drawnPolygon.getPath().getArray().map(p => p.toJSON());
        const centerLat = path.reduce((sum, p) => sum + p.lat, 0) / path.length;
        const centerLng = path.reduce((sum, p) => sum + p.lng, 0) / path.length;


        try {
             await addPoint({
                id: `announcement-${Date.now()}`,
                type: 'announcement',
                title: title,
                description: message,
                polygon: path,
                position: { lat: centerLat, lng: centerLng },
                authorId: user.uid,
                authorDisplayName: profile.displayName,
                lastReported: new Date().toISOString(),
                status: 'unknown',
                updates: [{
                    text: message,
                    authorId: user.uid,
                    authorDisplayName: profile.displayName,
                    timestamp: new Date().toISOString(),
                }]
            });

            toast({
                title: "Anúncio Enviado!",
                description: "A sua comunicação foi guardada e está visível no mapa para a área selecionada.",
            });

            // Reset form
            setTitle("");
            setMessage("");
            setClearPolygonTrigger(val => !val); // Trigger polygon clearing in child
            setDrawnPolygon(null);

        } catch (error) {
             toast({
                variant: "destructive",
                title: "Erro ao Enviar",
                description: "Não foi possível guardar o seu anúncio. Tente novamente.",
            });
        } finally {
            setIsSubmitting(false);
        }
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
                                    Escreva a sua mensagem e desenhe a área no mapa para notificar os cidadãos.
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
                                <Button onClick={handleSend} className="w-full" disabled={isSubmitting}>
                                     {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
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
                                    Use as ferramentas de desenho para definir a área de abrangência do seu anúncio.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[500px] p-0 relative">
                                <Map
                                    defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                                    defaultZoom={12}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                    styles={mapStyles}
                                >
                                     <DrawingManager onPolygonComplete={setDrawnPolygon} clearTrigger={clearPolygonTrigger} />
                                </Map>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(ComunicacoesPage, ['Agente Municipal', 'Administrador']);
