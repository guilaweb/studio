
"use client";

import React, { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import MarkerClusterer from "@googlemaps/markerclustererplus";
import type { PointOfInterest } from "@/lib/data";

interface DashboardClustererProps {
  data: google.maps.LatLngLiteral[];
}

const DashboardClusterer: React.FC<DashboardClustererProps> = ({ data }) => {
    const map = useMap();
    const markersRef = useRef<google.maps.Marker[]>([]);
    const clustererRef = useRef<MarkerClusterer | null>(null);

    // This effect is for initializing and cleaning up the clusterer
    useEffect(() => {
        if (!map) return;

        // Initialize clusterer
        if (!clustererRef.current) {
            // Create new markers
            const newMarkers = data.map(pos => 
                new google.maps.Marker({ position: pos })
            );
            markersRef.current = newMarkers;

            // Pass the map instance and markers to the constructor
            clustererRef.current = new MarkerClusterer(map, newMarkers, {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });
        }
        
        // Cleanup on unmount
        return () => {
            if (clustererRef.current) {
                clustererRef.current.clearMarkers();
            }
        };
    }, [map, data]); // Rerun if map or data changes

    // This effect is for updating markers when data changes after initial load
    useEffect(() => {
        if (!map || !clustererRef.current) return;

        // Clear existing markers
        clustererRef.current.clearMarkers();
        
        // Create new markers from the new data
        const newMarkers = data.map(pos => 
            new google.maps.Marker({ position: pos })
        );
        markersRef.current = newMarkers;

        // Add new markers to the clusterer
        clustererRef.current.addMarkers(newMarkers);
        
    }, [data, map]);

    return null;
};

export default DashboardClusterer;
