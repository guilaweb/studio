
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclustererplus";
import type { PointOfInterest } from "@/lib/data";

interface LandPlotClustererProps {
  landPlots: PointOfInterest[];
  onMarkerClick: (pointId: string) => void;
}

const LandPlotClusterer: React.FC<LandPlotClustererProps> = ({ landPlots, onMarkerClick }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const clusterer = useRef<MarkerClusterer | null>(null);

  // Initialize MarkerClusterer
  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  // Update markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers from clusterer and map
    clusterer.current?.clearMarkers();
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = landPlots.map((plot) => {
      const pinGlyph = document.createElement('div');
      pinGlyph.className = 'w-5 h-5 text-white flex items-center justify-center';
      pinGlyph.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square h-5 w-5"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;
      
      const pin = new google.maps.marker.PinElement({
        glyph: pinGlyph,
        background: '#a1a1aa', // gray as default
        borderColor: '#71717a',
      });
      
      const marker = new google.maps.Marker({
        position: plot.position,
        title: plot.title,
        content: pin.element, // Use content for PinElement
      });
      
      marker.addListener("click", () => {
        onMarkerClick(plot.id);
      });
      
      return marker;
    });

    setMarkers(newMarkers);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landPlots, map, onMarkerClick]);

  // Add/remove markers from clusterer
  useEffect(() => {
    if (markers.length > 0) {
      clusterer.current?.addMarkers(markers);
    }
    
    return () => {
      clusterer.current?.clearMarkers();
    };
  }, [markers]);

  return null;
};

export default LandPlotClusterer;


