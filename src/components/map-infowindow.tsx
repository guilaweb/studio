
"use client";

import React from 'react';
import Image from 'next/image';
import { PointOfInterest } from '@/lib/data';
import { Card, CardContent, CardDescription } from './ui/card';

interface MapInfoWindowProps {
  poi: PointOfInterest;
}

const MapInfoWindow: React.FC<MapInfoWindowProps> = ({ poi }) => {
  let photoUrl: string | undefined;

  // Find a photo from updates or files
  if (poi.updates && poi.updates.length > 0) {
      const sortedUpdates = poi.updates.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      photoUrl = sortedUpdates[0]?.photoDataUri;
  }
  
  if (!photoUrl && poi.files && poi.files.length > 0) {
      photoUrl = poi.files.find(f => f.url.match(/\.(jpeg|jpg|gif|png)$/))?.url;
  }


  return (
    <div className="p-1">
        <Card className="w-48 border-none shadow-lg">
            <CardContent className="p-0">
                {photoUrl && (
                <div className="relative h-24 w-full">
                    <Image
                    src={photoUrl}
                    alt={poi.title || "Imagem do Ponto de Interesse"}
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
