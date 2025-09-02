
"use client";

import React from 'react';
import { useMap } from "@vis.gl/react-google-maps";
import { PointOfInterest } from "@/lib/data";

const getPlotColors = (status: PointOfInterest['status']) => {
    switch (status) {
        case 'available':
            return { stroke: '#16a34a', fill: '#22c55e' }; // green
        case 'occupied':
        case 'reserved':
        case 'under_review':
            return { stroke: '#ea580c', fill: '#f97316' }; // orange
        case 'in_dispute':
            return { stroke: '#dc2626', fill: '#ef4444' }; // red
        case 'protected':
            return { stroke: '#155e75', fill: '#0e7490' }; // cyan
        default:
            return { stroke: '#a1a1aa', fill: '#71717a' }; // gray
    }
}


export const LandPlotPolygons: React.FC<{
    plots: PointOfInterest[];
    selectedPlotId: string | null;
    onPlotClick: (plotId: string) => void;
    onMouseOver?: (e: google.maps.MapMouseEvent, poi: PointOfInterest) => void;
    onMouseOut?: () => void;
}> = ({ plots, selectedPlotId, onPlotClick, onMouseOver, onMouseOut }) => {
    const map = useMap();
    const [polygons, setPolygons] = React.useState<google.maps.Polygon[]>([]);

    React.useEffect(() => {
        if (!map) return;
        
        polygons.forEach(p => p.setMap(null));

        const newPolygons = plots.map(plot => {
            const isSelected = plot.id === selectedPlotId;
            const colors = getPlotColors(plot.status);

            const poly = new google.maps.Polygon({
                paths: plot.polygon,
                strokeColor: isSelected ? 'hsl(var(--ring))' : colors.stroke,
                strokeOpacity: 0.9,
                strokeWeight: isSelected ? 3 : 2,
                fillColor: isSelected ? colors.fill : colors.fill,
                fillOpacity: isSelected ? 0.6 : 0.35,
                map: map,
                zIndex: isSelected ? 10 : 1,
            });

            poly.addListener('click', () => onPlotClick(plot.id));
            if(onMouseOver) {
                poly.addListener('mouseover', (e: google.maps.MapMouseEvent) => onMouseOver(e, plot));
            }
            if(onMouseOut) {
                poly.addListener('mouseout', onMouseOut);
            }
            
            return poly;
        });

        setPolygons(newPolygons);

        return () => {
            newPolygons.forEach(p => p.setMap(null));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, plots, selectedPlotId]);


    return null;
}
