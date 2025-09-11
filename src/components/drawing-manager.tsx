
"use client";

import React, { useEffect, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

type DrawingMode = google.maps.drawing.OverlayType;

interface DrawingManagerProps {
  onPolygonComplete?: (polygon: google.maps.Polygon | null) => void;
  onPolylineComplete?: (polyline: google.maps.Polyline | null) => void;
  initialPolygonPath?: google.maps.LatLngLiteral[] | null;
  initialPolylinePath?: google.maps.LatLngLiteral[] | null;
  allowedModes?: DrawingMode[];
}

const DrawingManager: React.FC<DrawingManagerProps> = ({
  onPolygonComplete,
  onPolylineComplete,
  initialPolygonPath,
  initialPolylinePath,
  allowedModes = [google.maps.drawing.OverlayType.POLYGON],
}) => {
  const map = useMap();
  const drawing = useMapsLibrary("drawing");
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentShape, setCurrentShape] = useState<google.maps.Polygon | google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !drawing) return;

    const manager = new drawing.DrawingManager({
      drawingMode: (initialPolygonPath || initialPolylinePath) ? null : allowedModes[0],
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: allowedModes,
      },
      polygonOptions: {
        fillColor: "hsl(var(--primary) / 0.2)",
        strokeColor: "hsl(var(--primary))",
        strokeWeight: 2,
        editable: true,
        zIndex: 1,
      },
      polylineOptions: {
        strokeColor: "hsl(var(--primary))",
        strokeWeight: 4,
        editable: true,
        zIndex: 1,
      }
    });

    setDrawingManager(manager);
    manager.setMap(map);

    const polygonListener = manager.addListener(
      "polygoncomplete",
      (poly: google.maps.Polygon) => {
        onPolygonComplete?.(poly);
        setCurrentShape(poly);
        manager.setDrawingMode(null); // Exit drawing mode
      }
    );
    
    const polylineListener = manager.addListener(
      "polylinecomplete",
      (poly: google.maps.Polyline) => {
        onPolylineComplete?.(poly);
        setCurrentShape(poly);
        manager.setDrawingMode(null);
      }
    );

    if (initialPolygonPath && onPolygonComplete) {
      const poly = new google.maps.Polygon({
        paths: initialPolygonPath,
        ...manager.get("polygonOptions"),
        editable: true,
      });
      poly.setMap(map);
      setCurrentShape(poly);
      onPolygonComplete(poly);
    }
    
    if (initialPolylinePath && onPolylineComplete) {
       const poly = new google.maps.Polyline({
        path: initialPolylinePath,
        ...manager.get("polylineOptions"),
        editable: true,
      });
      poly.setMap(map);
      setCurrentShape(poly);
      onPolylineComplete(poly);
    }

    return () => {
      polygonListener.remove();
      polylineListener.remove();
      manager.setMap(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, drawing, onPolygonComplete, onPolylineComplete]);

  const handleClearShape = () => {
    if (currentShape) {
        currentShape.setMap(null);
    }
    onPolygonComplete?.(null);
    onPolylineComplete?.(null);
    setCurrentShape(null);
    if (drawingManager) {
        drawingManager.setDrawingMode(allowedModes[0]);
    }
  };

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
      {currentShape && currentShape.getMap() && (
        <Button onClick={handleClearShape} variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar Desenho
        </Button>
      )}
    </div>
  );
};

export default DrawingManager;
