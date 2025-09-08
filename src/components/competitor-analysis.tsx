
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompetitorAnalysisProps {
    onResults: (results: google.maps.places.PlaceResult[]) => void;
    map: google.maps.Map | null;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ onResults }) => {
    const map = useMap();
    const places = useMapsLibrary('places');
    const [query, setQuery] = useState('Posto de combustível');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!places || !map) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Mapa ou serviço de locais não está pronto.' });
            return;
        }
        setLoading(true);
        onResults([]); // Clear previous results

        const request: google.maps.places.TextSearchRequest = {
            query,
            bounds: map.getBounds(),
        };

        const placesService = new places.PlacesService(map);
        placesService.textSearch(request, (results, status) => {
            setLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                onResults(results);
                toast({ title: 'Análise Concluída', description: `${results.length} concorrentes encontrados na área visível.` });
            } else {
                toast({ variant: 'destructive', title: 'Nenhum resultado', description: 'Não foram encontrados locais com o termo pesquisado.' });
            }
        });
    };
    
    return (
        <div className="p-4 pt-0">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Análise de Concorrência</h3>
            <div className="space-y-2">
                <Label htmlFor="competitor-query" className="sr-only">Termo de Pesquisa</Label>
                <Input
                    id="competitor-query"
                    placeholder="Ex: Posto de combustível"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={handleSearch} disabled={loading || !query} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    {loading ? 'A analisar...' : 'Analisar Concorrência'}
                </Button>
            </div>
        </div>
    );
};

export default CompetitorAnalysis;
