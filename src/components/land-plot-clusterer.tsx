
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import MarkerClusterer from "@googlemaps/markerclustererplus";
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
        // The third argument is options. We can specify custom cluster icons here if needed.
        // For now, we'll use the defaults.
        clusterer.current = new MarkerClusterer(map, [], {
             imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });
    }
  }, [map]);

  // Update markers
  useEffect(() => {
    // Clear previous markers
    clusterer.current?.clearMarkers();

    const newMarkers = landPlots.map((plot) => {
      const marker = new google.maps.Marker({
        position: plot.position,
        title: plot.title,
      });
      
      marker.addListener("click", () => {
        onMarkerClick(plot.id);
      });
      
      return marker;
    });

    setMarkers(newMarkers);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landPlots, onMarkerClick]);

  // Add/remove markers from clusterer
  useEffect(() => {
    if (markers.length > 0) {
      clusterer.current?.addMarkers(markers);
    }
    
    // The cleanup is handled when the markers are updated in the previous effect.
  }, [markers]);

  return null;
};

export default LandPlotClusterer;
