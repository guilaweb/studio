
"use client";

import React from 'react';
import Image from 'next/image';
import { PointOfInterest } from '@/lib/data';
import { Card, CardContent, CardDescription } from './ui/card';

interface MapInfoWindowProps {
  poi: PointOfInterest;
}

const MapInfoWindow: React.FC<MapInfoWindowProps> = ({ poi }) => {
  // The original photo is in the first update (sorted chronologically)
  const originalUpdate = poi.updates?.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
  const photoUrl = originalUpdate?.photoDataUri;

  return (
    <div className="p-1">
        <Card className="w-48 border-none shadow-lg">
            <CardContent className="p-0">
                {photoUrl && (
                <div className="relative h-24 w-full">
                    <Image
                    src={photoUrl}
                    alt={poi.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-md"
                    />
                </div>
                )}
                <div className="p-2">
                    <h3 className="text-sm font-semibold truncate">{poi.title}</h3>
                    <CardDescription className="text-xs truncate">{poi.description}</CardDescription>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default MapInfoWindow;
