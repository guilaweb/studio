
"use client";

import React, { useRef, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MapSearchBoxProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

export default function MapSearchBox({ onPlaceSelect }: MapSearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
        fields: ["geometry", "name", "formatted_address"],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      onPlaceSelect(place);
    });

    return () => {
        if (google && google.maps && google.maps.event) {
            google.maps.event.clearInstanceListeners(autocomplete);
        }
    }
  }, [places, onPlaceSelect]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Pesquisar endereço ou ponto de interesse..."
        className="w-full pl-10"
      />
    </div>
  );
};
