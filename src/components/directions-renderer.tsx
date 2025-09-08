
"use client";

import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { PointOfInterest } from '@/lib/data';

interface DirectionsRendererProps {
    waypoints: PointOfInterest[] | null;
}

const DirectionsRenderer: React.FC<DirectionsRendererProps> = ({ waypoints }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (!map || !routesLibrary) return;
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
             suppressMarkers: true, // We use our own markers
             polylineOptions: {
                 strokeColor: 'hsl(var(--primary))',
                 strokeOpacity: 0.8,
                 strokeWeight: 5,
             }
        }));
    }, [map, routesLibrary]);

    useEffect(() => {
        if (!directionsRenderer) return;
        directionsRenderer.setMap(map); // Attach renderer to map when it's ready
    }, [directionsRenderer, map])

    useEffect(() => {
        if (!routesLibrary || !directionsRenderer || !waypoints || waypoints.length < 2) {
            if(directionsRenderer) {
                directionsRenderer.setDirections({routes: []}); // Clear previous routes
            }
            return;
        };
        
        const directionsService = new routesLibrary.DirectionsService();

        const sortedWaypoints = [...waypoints].sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
            const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
            return priorityB - priorityA;
        });

        const origin = sortedWaypoints[0].position;
        const destination = sortedWaypoints[sortedWaypoints.length - 1].position;
        
        const intermediateWaypoints = sortedWaypoints.slice(1, -1).map(point => ({
            location: point.position,
            stopover: true,
        }));
        
        const request: google.maps.DirectionsRequest = {
            origin: { location: origin },
            destination: { location: destination },
            waypoints: intermediateWaypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
                directionsRenderer.setDirections(result);
            } else {
                console.error(`Error fetching directions ${result}`);
            }
        });

    }, [routesLibrary, directionsRenderer, waypoints]);

    return null;
};

export default DirectionsRenderer;

