
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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    if (!autocompleteRef.current) {
        autocompleteRef.current = new places.Autocomplete(inputRef.current, {
            fields: ["geometry", "name", "formatted_address"],
        });
    }

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current!.getPlace();
      onPlaceSelect(place);
    });

    return () => {
        if (listener) {
            listener.remove();
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
