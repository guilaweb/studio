
"use client";

import React, { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import MarkerClusterer, { MarkerClustererOptions } from "@googlemaps/markerclustererplus";
import type { PointOfInterest } from "@/lib/data";
import { getPinStyle } from "../map-component"; // We need a way to style the markers

interface DashboardClustererProps {
  points: PointOfInterest[];
}

const DashboardClusterer: React.FC<DashboardClustererProps> = ({ points }) => {
    const map = useMap();
    const markersRef = useRef<google.maps.Marker[]>([]);
    const clustererRef = useRef<MarkerClusterer | null>(null);

    useEffect(() => {
        if (!map) return;

        // Clean up previous markers and clusterer
        if (clustererRef.current) {
            clustererRef.current.clearMarkers();
        }
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Create new markers
        const newMarkers = points.map(point => {
             // We can't use AdvancedMarker here, so we create a simple icon
             const pinStyle = getPinStyle(point);
             const icon = {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: pinStyle.background || '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 1.5,
                scale: 8,
            };
            return new google.maps.Marker({ 
                position: point.position,
                icon: icon,
                title: point.title
            });
        });

        markersRef.current = newMarkers;

        const clustererOptions: MarkerClustererOptions = {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        };
        
        clustererRef.current = new MarkerClusterer(map, newMarkers, clustererOptions);

        return () => {
            if (clustererRef.current) {
                clustererRef.current.clearMarkers();
            }
        };
    }, [map, points]);

    return null;
};

export default DashboardClusterer;

    