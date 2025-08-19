
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

    if (!heatmap) {
      const newHeatmap = new visualization.HeatmapLayer({
        map: map,
        data: data.map(pos => new google.maps.LatLng(pos.lat, pos.lng)),
        radius: 20,
      });
      setHeatmap(newHeatmap);
    } else {
      heatmap.setData(data.map(pos => new google.maps.LatLng(pos.lat, pos.lng)));
    }

    // Cleanup on unmount or when map changes
    return () => {
      if (heatmap) {
        heatmap.setMap(null);
      }
    };
  }, [map, visualization, data, heatmap]);

  return null;
};

export default HeatmapLayer;
