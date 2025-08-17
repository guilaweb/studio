
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Trash2 } from "lucide-react";
import type { FormData } from "./property-registration-wizard";

// Re-using the DrawingManager component logic
const DrawingManager: React.FC<{
    onPolygonComplete: (polygon: google.maps.Polygon) => void;
    initialPolygonPath?: google.maps.LatLngLiteral[] | null;
}> = ({ onPolygonComplete, initialPolygonPath }) => {
    const map = useMap();
    const drawing = useMapsLibrary("drawing");
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map || !drawing) return;

        const manager = new drawing.DrawingManager({
            drawingMode: initialPolygonPath ? null : drawing.OverlayType.POLYGON,
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

        const listener = manager.addListener("polygoncomplete", (poly: google.maps.Polygon) => {
            onPolygonComplete(poly);
            setCurrentPolygon(poly);
            manager.setDrawingMode(null);
        });

        if (initialPolygonPath && !currentPolygon) {
            const poly = new google.maps.Polygon({
                paths: initialPolygonPath,
                ...manager.get("polygonOptions"),
                editable: true
            });
            poly.setMap(map);
            setCurrentPolygon(poly);
            onPolygonComplete(poly);
        }

        return () => {
            listener.remove();
            manager.setMap(null);
        };
    }, [map, drawing, onPolygonComplete, initialPolygonPath, currentPolygon]);
    
    const handleClearPolygon = () => {
        if (currentPolygon) {
            currentPolygon.setMap(null);
            setCurrentPolygon(null);
            if (drawingManager) {
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            }
        }
    };

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

interface LocationStepProps {
    onNext: (data: Partial<FormData>) => void;
    initialPolygon: google.maps.LatLngLiteral[] | null;
}

export default function LocationStep({ onNext, initialPolygon }: LocationStepProps) {
    const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);

    const handlePolygonComplete = (poly: google.maps.Polygon) => {
        setDrawnPolygon(poly);
    };

    const handleNextClick = () => {
        if (drawnPolygon) {
            const path = drawnPolygon.getPath().getArray().map(p => p.toJSON());
            onNext({ polygon: path });
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative h-[50vh] w-full bg-muted rounded-md overflow-hidden">
                <Map
                    defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                    defaultZoom={13}
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                >
                    <DrawingManager
                        onPolygonComplete={handlePolygonComplete}
                        initialPolygonPath={initialPolygon}
                    />
                </Map>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleNextClick} disabled={!drawnPolygon}>
                    Próximo Passo
                </Button>
            </div>
        </div>
    );
}
