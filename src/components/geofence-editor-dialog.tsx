
"use client";

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Geofence, saveGeofence } from '@/services/geofence-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserProfile } from '@/lib/data';

// DrawingManager Component (similar to the one in LandPlotReport)
const DrawingManager: React.FC<{onPolygonComplete: (polygon: google.maps.Polygon) => void, initialPolygonPath?: google.maps.LatLngLiteral[] | null}> = ({onPolygonComplete, initialPolygonPath}) => {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map || !drawing) return;

        // Clear previous instances if they exist
        if (drawingManager) drawingManager.setMap(null);
        if (currentPolygon) currentPolygon.setMap(null);

        const manager = new drawing.DrawingManager({
            drawingMode: initialPolygonPath ? null : drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
                fillColor: "hsl(var(--destructive) / 0.2)",
                strokeColor: "hsl(var(--destructive))",
                strokeWeight: 2,
                editable: true,
            },
        });
        
        setDrawingManager(manager);
        manager.setMap(map);
        
        const listener = manager.addListener('polygoncomplete', (poly: google.maps.Polygon) => {
            onPolygonComplete(poly);
            setCurrentPolygon(poly);
            manager.setDrawingMode(null);
        });

        if (initialPolygonPath) {
            const poly = new google.maps.Polygon({
                paths: initialPolygonPath,
                ...manager.get('polygonOptions'),
                editable: true,
            });
            poly.setMap(map);
            setCurrentPolygon(poly);
            onPolygonComplete(poly);
        }
        
        return () => {
            listener.remove();
            manager.setMap(null);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, drawing, initialPolygonPath]);

    const handleClearPolygon = () => {
        if (currentPolygon) {
            currentPolygon.setMap(null);
            setCurrentPolygon(null);
            onPolygonComplete(new google.maps.Polygon()); // Send an empty polygon to clear the state
            if (drawingManager) {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            }
        }
    }

    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            {currentPolygon && (
                <Button onClick={handleClearPolygon} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar e Redesenhar
                </Button>
            )}
        </div>
    );
};


interface GeofenceEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  geofenceToEdit: Omit<Geofence, 'createdAt'> | null;
}

const GeofenceEditorDialog: React.FC<GeofenceEditorDialogProps> = ({ open, onOpenChange, geofenceToEdit }) => {
    const [name, setName] = useState('');
    const [assignedTeam, setAssignedTeam] = useState<UserProfile['team'] | undefined>();
    const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open && geofenceToEdit) {
            setName(geofenceToEdit.name);
            setAssignedTeam(geofenceToEdit.assignedTeam);
        } else if (!open) {
            // Reset state when dialog closes
            setName('');
            setAssignedTeam(undefined);
            setDrawnPolygon(null);
        }
    }, [open, geofenceToEdit]);
    
    const handleSave = async () => {
        if (!name.trim()) {
            toast({ variant: 'destructive', title: 'Nome em falta', description: 'Por favor, dê um nome à cerca virtual.' });
            return;
        }
        if (!drawnPolygon || !drawnPolygon.getPath() || drawnPolygon.getPath().getLength() < 3) {
            toast({ variant: 'destructive', title: 'Área em falta', description: 'Por favor, desenhe uma área no mapa.' });
            return;
        }
        
        setIsSaving(true);
        try {
            const polygonPath = drawnPolygon.getPath().getArray().map(p => p.toJSON());
            await saveGeofence({
                ...(geofenceToEdit && { id: geofenceToEdit.id }),
                name,
                polygon: polygonPath,
                assignedTeam,
            });
            toast({ title: 'Cerca Virtual Guardada', description: `A cerca "${name}" foi guardada com sucesso.` });
            onOpenChange(false);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Erro ao Guardar', description: 'Não foi possível guardar a cerca virtual.' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{geofenceToEdit ? 'Editar Cerca Virtual' : 'Nova Cerca Virtual'}</DialogTitle>
                    <DialogDescription>
                        Desenhe uma área no mapa, dê-lhe um nome e atribua uma equipa responsável.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="geofence-name">Nome da Cerca</Label>
                            <Input id="geofence-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Zona de Responsabilidade Norte" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="assigned-team">Equipa Responsável</Label>
                             <Select value={assignedTeam} onValueChange={(v) => setAssignedTeam(v as any)}>
                                <SelectTrigger id="assigned-team">
                                    <SelectValue placeholder="Selecione uma equipa" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Saneamento">Saneamento</SelectItem>
                                    <SelectItem value="Eletricidade">Eletricidade</SelectItem>
                                    <SelectItem value="Geral">Geral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="relative h-[50vh] w-full bg-muted rounded-md overflow-hidden">
                        <Map
                            mapId="geofence-editor-map"
                            defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                            defaultZoom={13}
                            gestureHandling="greedy"
                            disableDefaultUI={false}
                        >
                            <DrawingManager 
                                onPolygonComplete={setDrawnPolygon} 
                                initialPolygonPath={geofenceToEdit?.polygon || null}
                            />
                        </Map>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Guardar Cerca
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GeofenceEditorDialog;
