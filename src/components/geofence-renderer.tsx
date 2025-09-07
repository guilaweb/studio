
"use client";

import React, { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useGeofences } from '@/services/geofence-service';

const GeofenceRenderer: React.FC = () => {
    const map = useMap();
    const { geofences } = useGeofences();
    const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);

    useEffect(() => {
        if (!map) return;

        // Clean up previous polygons
        polygons.forEach(p => p.setMap(null));

        const newPolygons = geofences.map(geofence => {
            return new google.maps.Polygon({
                paths: geofence.polygon,
                strokeColor: "hsl(var(--destructive))",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "hsl(var(--destructive))",
                fillOpacity: 0.1,
                map: map,
                zIndex: -1, // Keep geofences in the background
            });
        });

        setPolygons(newPolygons);

        return () => {
            newPolygons.forEach(p => p.setMap(null));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, geofences]);

    return null;
};

export default GeofenceRenderer;
