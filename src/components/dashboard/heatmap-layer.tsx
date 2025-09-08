
"use client";

import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface HeatmapLayerProps {
  data: google.maps.LatLngLiteral[];
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ data }) => {
  const map = useMap();
  const visualization = useMapsLibrary('visualization');
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || !visualization) return;

    // If heatmap exists, clear its data before creating a new one or updating
    if (heatmap) {
      heatmap.setMap(null);
    }
    
    if (data.length > 0) {
        const newHeatmap = new visualization.HeatmapLayer({
            map: map,
            data: data.map(pos => new google.maps.LatLng(pos.lat, pos.lng)),
            radius: 40,
            gradient: [
                "rgba(0, 255, 255, 0)",
                "rgba(0, 255, 255, 1)",
                "rgba(0, 191, 255, 1)",
                "rgba(0, 127, 255, 1)",
                "rgba(0, 63, 255, 1)",
                "rgba(0, 0, 255, 1)",
                "rgba(0, 0, 223, 1)",
                "rgba(0, 0, 191, 1)",
                "rgba(0, 0, 159, 1)",
                "rgba(0, 0, 127, 1)",
                "rgba(63, 0, 91, 1)",
                "rgba(127, 0, 63, 1)",
                "rgba(191, 0, 31, 1)",
                "rgba(255, 0, 0, 1)"
            ]
        });
        setHeatmap(newHeatmap);
    } else {
        setHeatmap(null); // No data, no heatmap
    }

    // Cleanup on unmount
    return () => {
      if (heatmap) {
        heatmap.setMap(null);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, visualization, data]);

  return null;
};

export default HeatmapLayer;

