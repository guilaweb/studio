
"use client";

import React, { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface DirectionsRendererProps {
    waypoints: google.maps.LatLngLiteral[] | null;
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

        const origin = waypoints[0];
        const destination = waypoints[waypoints.length - 1];
        const intermediateWaypoints = waypoints.slice(1, -1).map(location => ({
            location,
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
