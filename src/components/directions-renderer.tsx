

"use client";

import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { PointOfInterest } from '@/lib/data';

interface DirectionsRendererProps {
    waypoints: PointOfInterest[] | null;
    avoidBadWeather?: boolean; // New prop for simulation
}

const DirectionsRenderer: React.FC<DirectionsRendererProps> = ({ waypoints, avoidBadWeather = false }) => {
    const map = useMap();
    const routes = useMapsLibrary('routes');
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (!map || !routes) return;
        setDirectionsRenderer(new routes.DirectionsRenderer({
             suppressMarkers: true, // We use our own markers
             polylineOptions: {
                 strokeColor: 'hsl(var(--primary))',
                 strokeOpacity: 0.8,
                 strokeWeight: 5,
             }
        }));
    }, [map, routes]);

    useEffect(() => {
        if (!directionsRenderer) return;
        directionsRenderer.setMap(map); // Attach renderer to map when it's ready
    }, [directionsRenderer, map])

    useEffect(() => {
        if (!routes || !directionsRenderer || !waypoints || waypoints.length < 2) {
            if(directionsRenderer) {
                directionsRenderer.setDirections({routes: []}); // Clear previous routes
            }
            return;
        };
        
        const directionsService = new routes.DirectionsService();

        const sortedWaypoints = [...waypoints].sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
            const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
            return priorityB - priorityA;
        });

        const origin = sortedWaypoints[0].position;
        const destination = sortedWaypoints[sortedWaypoints.length - 1].position;
        
        let intermediateWaypoints = sortedWaypoints.slice(1, -1).map(point => ({
            location: point.position,
            stopover: true,
        }));
        
        // --- Weather Simulation Logic ---
        if (avoidBadWeather && intermediateWaypoints.length > 0) {
            const detourPoint = { 
                lat: intermediateWaypoints[0].location.lat + 0.005, 
                lng: intermediateWaypoints[0].location.lng + 0.005
            };
            intermediateWaypoints.splice(0, 0, { location: detourPoint, stopover: true });
        } else if (avoidBadWeather && waypoints.length >= 2) {
             const detourPoint = {
                lat: (waypoints[0].position.lat + waypoints[1].position.lat) / 2 + 0.005,
                lng: (waypoints[0].position.lng + waypoints[1].position.lng) / 2 + 0.005,
            };
            intermediateWaypoints.push({ location: detourPoint, stopover: true });
        }
        // --- End of Simulation Logic ---


        const request: google.maps.DirectionsRequest = {
            origin,
            destination,
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

    }, [routes, directionsRenderer, waypoints, avoidBadWeather]);

    return null;
};

export default DirectionsRenderer;

