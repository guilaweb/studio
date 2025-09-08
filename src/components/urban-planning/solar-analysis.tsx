
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sun, Zap, AreaChart, BarChart } from 'lucide-react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

type BuildingInsights = google.maps.solar.BuildingInsights;

export function SolarAnalysis({ map }: { map: google.maps.Map | null }) {
    const solar = useMapsLibrary('solar');
    const [solarData, setSolarData] = useState<BuildingInsights | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const findBuildingInsights = useCallback(async (position: google.maps.LatLngLiteral) => {
        if (!solar) return;
        setLoading(true);
        setError(null);
        setSolarData(null);
        
        try {
            const insights = await solar.getBuildingInsights(position, 100);
            if (!insights) {
                setError("Nenhuma informação solar encontrada para este local. Tente um edifício maior.");
            }
            setSolarData(insights);
        } catch (e) {
            setError("Não foi possível obter dados solares para este local. A API pode não estar disponível na sua região ou para este edifício.");
        } finally {
            setLoading(false);
        }
    }, [solar]);

    useEffect(() => {
        if (!map) return;

        const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                findBuildingInsights(e.latLng.toJSON());
            }
        });

        return () => clickListener.remove();

    }, [map, findBuildingInsights]);

    const resetState = () => {
        setSolarData(null);
        setError(null);
        setLoading(false);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Análise de Potencial Solar</CardTitle>
                <CardDescription>Clique num telhado no mapa 3D para analisar o seu potencial de energia solar.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">A analisar...</span>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                        <Button variant="link" size="sm" onClick={resetState}>Tentar Novamente</Button>
                    </div>
                ) : solarData ? (
                    <div className="space-y-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <h4 className="font-semibold text-green-800 dark:text-green-300">Resultados da Análise</h4>
                            <p className="text-xs text-green-700 dark:text-green-400">Potencial anual estimado para este edifício.</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-muted-foreground"><Sun className="h-4 w-4"/> Horas de Sol / Ano</span>
                            <span className="font-bold">{solarData.solarPotential.maxSunshineHoursPerYear.toFixed(0)}h</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-muted-foreground"><AreaChart className="h-4 w-4"/> Área Útil (Telhado)</span>
                            <span className="font-bold">{solarData.solarPotential.wholeRoofStats.areaMeters2.toFixed(2)} m²</span>
                        </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-muted-foreground"><BarChart className="h-4 w-4"/> Produção Potencial</span>
                            <span className="font-bold">{solarData.solarPotential.maxArrayAreaMeters2.toFixed(2)} m²</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={resetState} className="w-full">Limpar Análise</Button>
                    </div>
                ) : (
                    <div className="text-center p-4 text-sm text-muted-foreground">
                        Clique num telhado para começar a análise.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

    