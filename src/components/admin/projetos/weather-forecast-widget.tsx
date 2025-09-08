
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, Wind, AlertTriangle, CalendarCheck } from 'lucide-react';

const forecastData = [
    { day: 'SEG', Icon: Sun, max: 32, min: 20, wind: 10, rain: 0 },
    { day: 'TER', Icon: Sun, max: 33, min: 21, wind: 12, rain: 0 },
    { day: 'QUA', Icon: Cloud, max: 31, min: 22, wind: 25, rain: 10 },
    { day: 'QUI', Icon: Cloud, max: 30, min: 21, wind: 35, rain: 20 },
    { day: 'SEX', Icon: CloudRain, max: 28, min: 20, wind: 15, rain: 80 },
];

const getWorkCondition = () => {
    const highWindAlert = forecastData.find(d => d.wind > 30);
    const highRainAlert = forecastData.find(d => d.rain > 50);

    if (highWindAlert) {
        return {
            level: 'warning',
            message: `Atenção: Vento forte previsto para ${highWindAlert.day} (${highWindAlert.wind} km/h). Não recomendado para trabalhos em altura.`,
        };
    }
    if (highRainAlert) {
         return {
            level: 'warning',
            message: `Chuva forte prevista para ${highRainAlert.day}. Planeie a betonagem e proteja os materiais em conformidade.`,
        };
    }

    return {
        level: 'good',
        message: 'Condições favoráveis para todos os tipos de trabalho nos próximos dias.',
    };
};

export default function WeatherForecastWidget() {
    const workCondition = getWorkCondition();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Previsão Meteorológica e Condições de Obra</CardTitle>
                <CardDescription>Previsão para os próximos 5 dias no local do projeto.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-5 gap-2 text-center">
                    {forecastData.map(day => (
                        <div key={day.day} className="p-2 rounded-lg bg-muted/50 flex flex-col items-center gap-1">
                            <p className="text-xs font-semibold text-muted-foreground">{day.day}</p>
                            <day.Icon className="h-8 w-8 text-primary" />
                            <p className="text-sm font-bold">{day.max}°</p>
                            <p className="text-xs text-muted-foreground">{day.min}°</p>
                        </div>
                    ))}
                </div>
                 <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 ${workCondition.level === 'good' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
                    {workCondition.level === 'good' ? <CalendarCheck className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                    <p className="text-sm">{workCondition.message}</p>
                </div>
            </CardContent>
        </Card>
    );
}
