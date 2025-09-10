
"use client";

import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { PointOfInterest } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface DirectionsRendererProps {
    waypoints?: PointOfInterest[] | null;
    path?: google.maps.LatLngLiteral[] | null;
    avoidBadWeather?: boolean; // This can be used later with more complex routing
}

const DirectionsRenderer: React.FC<DirectionsRendererProps> = ({ waypoints, path, avoidBadWeather }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const { toast } = useToast();
    
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [pathPolyline, setPathPolyline] = useState<google.maps.Polyline | null>(null);

    // Initialize DirectionsRenderer for waypoints
    useEffect(() => {
        if (!map || !routesLibrary) return;
        if (!directionsRenderer) {
            setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: 'hsl(var(--primary))',
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                }
            }));
        }
    }, [map, routesLibrary, directionsRenderer]);
    
    // Initialize Polyline for simple path
     useEffect(() => {
        if (!map) return;
        if (!pathPolyline) {
            setPathPolyline(new google.maps.Polyline({
                strokeColor: 'hsl(var(--accent))',
                strokeOpacity: 0.9,
                strokeWeight: 5,
                 icons: [{
                    icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW },
                    offset: '100%',
                    repeat: '50px'
                }],
            }));
        }
    }, [map, pathPolyline]);


    // Cleanup and attach renderers to map
    useEffect(() => {
        if (!map) return;
        if (directionsRenderer) directionsRenderer.setMap(map);
        if (pathPolyline) pathPolyline.setMap(map);
        
        return () => {
             if (directionsRenderer) directionsRenderer.setMap(null);
             if (pathPolyline) pathPolyline.setMap(null);
        }
    }, [directionsRenderer, pathPolyline, map]);

    // Handle waypoint routing
    useEffect(() => {
        if (!routesLibrary || !directionsRenderer) {
            return;
        }
        if (!waypoints || waypoints.length < 2) {
            directionsRenderer.setDirections({ routes: [] }); // Clear previous routes
            return;
        }
        
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
                toast({ variant: 'destructive', title: 'Erro de Roteirização', description: 'Não foi possível calcular a rota.'})
            }
        });

    }, [routesLibrary, directionsRenderer, waypoints, toast]);
    
    // Handle simple path rendering
    useEffect(() => {
        if (!pathPolyline) return;

        if (!path || path.length < 2) {
             pathPolyline.setPath([]); // Clear previous path
             return;
        }
        pathPolyline.setPath(path);

    }, [pathPolyline, path]);


    return null;
};

export default DirectionsRenderer;
