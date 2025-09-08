
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
    const geometryLibrary = useMapsLibrary('geometry'); // Needed for path analysis
    const { toast } = useToast();
    
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [snappedPathPolyline, setSnappedPathPolyline] = useState<google.maps.Polyline | null>(null);

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

    // Cleanup and attach renderer to map
    useEffect(() => {
        if (!directionsRenderer) return;
        directionsRenderer.setMap(map);
        return () => directionsRenderer.setMap(null);
    }, [directionsRenderer, map]);

    // Cleanup snapped polyline
    useEffect(() => {
        if (!snappedPathPolyline) return;
        snappedPathPolyline.setMap(map);
        return () => snappedPathPolyline.setMap(null);
    }, [snappedPathPolyline, map]);

    // Handle waypoint routing
    useEffect(() => {
        if (!routesLibrary || !directionsRenderer || !waypoints || waypoints.length < 2) {
            directionsRenderer?.setDirections({ routes: [] }); // Clear previous routes
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

    // Handle road snapping for a single path
    useEffect(() => {
        if (!map || !path || path.length < 2) {
            if (snappedPathPolyline) snappedPathPolyline.setMap(null); // Clear previous path
            return;
        }

        const roadsService = new google.maps.roads.RoadsService();

        roadsService.snapToRoads({ path, interpolate: true }, (result, status) => {
            if (status === 'OK' && result) {
                const snappedPoints = result.map(p => p.location.toJSON());
                 if (snappedPathPolyline) {
                    snappedPathPolyline.setPath(snappedPoints);
                } else {
                    const newPolyline = new google.maps.Polyline({
                        path: snappedPoints,
                        strokeColor: '#0ea5e9', // A different color to distinguish snapped paths
                        strokeOpacity: 0.9,
                        strokeWeight: 4
                    });
                    newPolyline.setMap(map);
                    setSnappedPathPolyline(newPolyline);
                }
            } else {
                console.error(`Error snapping to roads: ${status}`, result);
                toast({ variant: 'destructive', title: 'Erro de Correção', description: 'Não foi possível ajustar o percurso à estrada.'})
            }
        })

    }, [map, path, snappedPathPolyline, toast]);


    return null;
};

export default DirectionsRenderer;
