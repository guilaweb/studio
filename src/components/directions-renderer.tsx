
"use client";

import React, { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { PointOfInterest } from '@/lib/data';

interface DirectionsRendererProps {
    waypoints: PointOfInterest[] | null;
}

const DirectionsRenderer: React.FC<DirectionsRendererProps> = ({ waypoints }) => {
    const map = useMap();
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (!map) return;
        setDirectionsService(new google.maps.DirectionsService());
        setDirectionsRenderer(new google.maps.DirectionsRenderer({ map }));
    }, [map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !waypoints || waypoints.length < 2) {
            // Clear previous route if waypoints are gone
            if(directionsRenderer) {
                directionsRenderer.setDirections({routes: []});
            }
            return;
        };
        
        // Sort waypoints by priority: high -> medium -> low -> undefined
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

    }, [directionsService, directionsRenderer, waypoints]);

    return null; // This component does not render anything itself
};

export default DirectionsRenderer;
