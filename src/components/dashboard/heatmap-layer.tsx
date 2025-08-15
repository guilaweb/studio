
"use client";

import { useEffect, useState } from 'react';
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
      setHeatmap(new visualization.HeatmapLayer({
        map: map,
        radius: 20,
        opacity: 0.8,
      }));
    }

    return () => {
      if (heatmap) {
        heatmap.setMap(null);
      }
    };
  }, [map, visualization, heatmap]);

  useEffect(() => {
    if (heatmap) {
      const points = data.map(pos => new google.maps.LatLng(pos.lat, pos.lng));
      heatmap.setData(points);
    }
  }, [heatmap, data]);

  return null;
};

export default HeatmapLayer;

    