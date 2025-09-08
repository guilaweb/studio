
"use client";

import React, { useEffect, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

interface DrawingManagerProps {
  onPolygonComplete: (polygon: google.maps.Polygon) => void;
  initialPolygonPath?: google.maps.LatLngLiteral[] | null;
}

const DrawingManager: React.FC<DrawingManagerProps> = ({
  onPolygonComplete,
  initialPolygonPath,
}) => {
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
        zIndex: 1,
      },
    });

    setDrawingManager(manager);
    manager.setMap(map);

    const listener = manager.addListener(
      "polygoncomplete",
      (poly: google.maps.Polygon) => {
        onPolygonComplete(poly);
        setCurrentPolygon(poly);
        manager.setDrawingMode(null); // Exit drawing mode
      }
    );

    if (initialPolygonPath && !currentPolygon) {
      const poly = new google.maps.Polygon({
        paths: initialPolygonPath,
        ...manager.get("polygonOptions"),
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
  }, [map, drawing, onPolygonComplete, initialPolygonPath]);

  const handleClearPolygon = () => {
    if (currentPolygon) {
        currentPolygon.setMap(null);
    }
    onPolygonComplete(new google.maps.Polygon()); // Inform parent that polygon is cleared
    setCurrentPolygon(null);
    if (drawingManager) {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
      {currentPolygon && currentPolygon.getMap() && (
        <Button onClick={handleClearPolygon} variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar e Redesenhar
        </Button>
      )}
    </div>
  );
};

export default DrawingManager;
