
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

    useEffect(() => {
        if (!map) return;
        if (!clustererRef.current) {
            clustererRef.current = new MarkerClusterer({ map });
        }
    }, [map]);


    useEffect(() => {
        if (!map || !clustererRef.current) return;

        // Clear existing markers from the clusterer and map
        clustererRef.current.clearMarkers();
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Create new markers
        const newMarkers = data.map(pos => 
            new google.maps.Marker({ position: pos })
        );
        
        markersRef.current = newMarkers;
        clustererRef.current.addMarkers(newMarkers);
        
    }, [data, map]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (clustererRef.current) {
                clustererRef.current.clearMarkers();
            }
        };
    }, []);

    return null;
};

export default DashboardClusterer;
