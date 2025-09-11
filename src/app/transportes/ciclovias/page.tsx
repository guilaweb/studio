
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Layers, Bike, Trash2, Search, Route, Save, Loader2 } from "lucide-react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { usePoints } from "@/hooks/use-points";
import DrawingManager from "@/components/drawing-manager";
import { PointOfInterestMarker } from "@/components/map-component";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { PointOfInterest, typeLabelMap } from "@/lib/data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
    totalLength: number; // in meters
    nearbyPois: Record<string, number>;
}


function BikeLanePlanningPage() {
    const { allData, loading, addPoint } = usePoints();
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [drawnPolyline, setDrawnPolyline] = React.useState<google.maps.Polyline | null>(null);
    const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null);
    const geometry = useMapsLibrary('geometry');
    const drawing = useMapsLibrary('drawing');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false);
    const [proposalName, setProposalName] = React.useState('');
    const [proposalDescription, setProposalDescription] = React.useState('');


    const handlePolylineComplete = (poly: google.maps.Polyline | null) => {
        if (drawnPolyline) {
            drawnPolyline.setMap(null);
        }
        setDrawnPolyline(poly);
        if(!poly) {
             handleClearAnalysis();
        }
    };
    
    const handleRunAnalysis = () => {
        if (!drawnPolyline || !geometry || !drawnPolyline.getMap()) {
            setAnalysisResult(null);
            return;
        };

        const path = drawnPolyline.getPath();
        if (!path || path.getLength() === 0) {
            setAnalysisResult(null);
            return;
        }

        const length = geometry.spherical.computeLength(path);
        
        const nearbyPois = allData.reduce((acc, poi) => {
            const poiLatLng = new google.maps.LatLng(poi.position.lat, poi.position.lng);
            if (geometry.poly.isLocationOnEdge(poiLatLng, drawnPolyline, 1e-1)) { // 200m buffer tolerance (approx)
                 const typeName = typeLabelMap[poi.type] || 'Outro';
                 acc[typeName] = (acc[typeName] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        setAnalysisResult({
            totalLength: length,
            nearbyPois
        });
    };
    
     const handleClearAnalysis = () => {
        if (drawnPolyline) {
            drawnPolyline.setMap(null);
        }
        setDrawnPolyline(null);
        setAnalysisResult(null);
    };

    const handleSaveProposal = async () => {
        if (!drawnPolyline || !proposalName || !user || !profile) {
            toast({ variant: 'destructive', title: 'Dados em falta', description: 'O nome da proposta é obrigatório.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const polylinePath = drawnPolyline.getPath().getArray().map(p => p.toJSON());
            const centerLat = polylinePath.reduce((sum, p) => sum + p.lat, 0) / polylinePath.length;
            const centerLng = polylinePath.reduce((sum, p) => sum + p.lng, 0) / polylinePath.length;

            const pointToAdd = {
                id: `bike_lane-${Date.now()}`,
                type: 'bike_lane',
                title: proposalName,
                description: proposalDescription,
                polyline: polylinePath,
                position: { lat: centerLat, lng: centerLng },
                authorId: user.uid,
                authorDisplayName: profile.displayName,
                lastReported: new Date().toISOString(),
                status: 'submitted',
                 updates: [{
                    id: `update-${Date.now()}`,
                    text: 'Proposta de ciclovia criada.',
                    authorId: user.uid,
                    authorDisplayName: profile.displayName,
                    timestamp: new Date().toISOString(),
                }]
            };

            await addPoint(pointToAdd as any);
            toast({ title: 'Proposta Guardada!', description: `A ciclovia "${proposalName}" foi guardada com sucesso.` });
            setIsSaveDialogOpen(false);
            setProposalName('');
            setProposalDescription('');
            handleClearAnalysis();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao Guardar', description: 'Não foi possível guardar a proposta.' });
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['drawing', 'geometry']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/transportes">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Planeamento de Ciclovias
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="md:col-span-1 lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bike className="h-5 w-5"/> Painel de Planeamento</CardTitle>
                                <CardDescription>Desenhe uma proposta de ciclovia no mapa e depois clique em "Analisar Rota" para ver os detalhes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={handleRunAnalysis} disabled={!drawnPolyline}>
                                    <Search className="mr-2 h-4 w-4"/>
                                    Analisar Rota
                                </Button>
                                {analysisResult ? (
                                    <>
                                        <div className="p-3 bg-primary/10 rounded-md">
                                            <p className="font-bold text-primary">{(analysisResult.totalLength / 1000).toFixed(2).toLocaleString('pt-PT')} km</p>
                                            <p className="text-xs font-semibold text-primary/80">Comprimento da Rota</p>
                                        </div>
                                         <h4 className="font-semibold text-sm pt-2">Pontos de Interesse Conectados:</h4>
                                        <div className="space-y-1 text-sm">
                                            {Object.keys(analysisResult.nearbyPois).length > 0 ? (
                                                Object.entries(analysisResult.nearbyPois).map(([type, count]) => (
                                                    <div key={type} className="flex justify-between items-center">
                                                        <span className="text-muted-foreground">{type}</span>
                                                        <span className="font-medium">{count}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted-foreground text-xs">Nenhum ponto de interesse relevante encontrado perto desta rota.</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleClearAnalysis} variant="destructive" className="flex-1">
                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                Limpar
                                            </Button>
                                             <Button onClick={() => setIsSaveDialogOpen(true)} className="flex-1">
                                                <Save className="mr-2 h-4 w-4"/>
                                                Guardar
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                     <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                        Use as ferramentas no topo do mapa para desenhar uma rota e depois clique em "Analisar".
                                     </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card className="h-[calc(100vh-10rem)]">
                             <Map
                                mapId="ciclovia-planning-map"
                                defaultCenter={{ lat: -8.83, lng: 13.23 }}
                                defaultZoom={13}
                                gestureHandling={'greedy'}
                                disableDefaultUI={false}
                            >
                                {drawing && geometry && (
                                    <DrawingManager
                                        onPolylineComplete={handlePolylineComplete}
                                        allowedModes={[drawing.OverlayType.POLYLINE]}
                                    />
                                )}
                                {loading ? null : (
                                    allData.map(point => (
                                        <PointOfInterestMarker
                                            key={point.id}
                                            point={point}
                                            onClick={() => {}}
                                            onMouseOut={() => {}}
                                            onMouseOver={() => {}}
                                        />
                                    ))
                                )}
                            </Map>
                        </Card>
                    </div>
                </main>
            </div>
             <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Guardar Proposta de Ciclovia</AlertDialogTitle>
                        <AlertDialogDescription>Dê um nome e uma breve descrição a esta nova proposta de rota.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="proposal-name">Nome da Ciclovia</Label>
                            <Input id="proposal-name" value={proposalName} onChange={(e) => setProposalName(e.target.value)} placeholder="Ex: Ciclovia Marginal"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="proposal-description">Descrição (Opcional)</Label>
                            <Textarea id="proposal-description" value={proposalDescription} onChange={(e) => setProposalDescription(e.target.value)} placeholder="Ex: Ligação entre a baixa e a zona sul..."/>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveProposal} disabled={isSubmitting || !proposalName}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Guardar Proposta
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </APIProvider>
    );
}

export default withAuth(BikeLanePlanningPage, ['Agente Municipal', 'Administrador', 'Super Administrador']);
