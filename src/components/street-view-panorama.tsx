
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Card, CardContent } from '@/components/ui/card';
import { CameraOff } from 'lucide-react';

interface StreetViewPanoramaProps {
  location: google.maps.LatLngLiteral;
}

const StreetViewPanorama: React.FC<StreetViewPanoramaProps> = ({ location }) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const streetview = useMapsLibrary('streetview');
  const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!streetview || !streetViewRef.current) {
        return;
    }
    
    // Always create a new panorama instance when location or library changes.
    const panoramaInstance = new google.maps.StreetViewPanorama(streetViewRef.current, {
        position: location,
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
        motionTracking: false,
        motionTrackingControl: false,
        showRoadLabels: false,
        linksControl: true,
        panControl: true,
        enableCloseButton: false,
        fullscreenControl: false,
    });
    
    const service = new google.maps.StreetViewService();
    service.getPanorama({ location, radius: 50 }, (data, stat) => {
        if (stat === 'OK') {
            setStatus('success');
            panoramaInstance.setVisible(true);
        } else {
            console.warn('Street View data not found for this location.');
            setStatus('error');
            panoramaInstance.setVisible(false);
        }
    });

    setPanorama(panoramaInstance);

  }, [streetview, location]);

  if (status === 'error') {
    return (
        <Card className="aspect-video bg-muted flex flex-col items-center justify-center text-center text-muted-foreground">
            <CameraOff className="h-8 w-8 mb-2" />
            <p className="text-sm">Street View indisponível para este local.</p>
        </Card>
    );
  }
  
  return <div ref={streetViewRef} className="h-48 w-full rounded-md bg-muted" />;
};

export default StreetViewPanorama;
