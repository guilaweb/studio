
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, Info } from 'lucide-react';
import { Button } from '../ui/button';

interface Alert {
    id: string;
    time: string;
    description: string;
    level: 'critical' | 'warning' | 'info';
}

const placeholderAlerts: Alert[] = [
    { id: '1', time: '10:32', description: 'Veículo LD-01-00-AA excedeu 100 km/h na EN-100.', level: 'critical' },
    { id: '2', time: '10:15', description: 'Motorista Demonstração Silva acionou o botão de pânico.', level: 'critical' },
    { id: '3', time: '09:50', description: 'Veículo LD-02-00-AA saiu da rota planejada.', level: 'warning' },
    { id: '4', time: '09:45', description: 'Veículo LD-03-00-AA com ignição ligada e parado há 15 min.', level: 'info' },
];

const alertConfig = {
    critical: { icon: AlertTriangle, color: 'text-red-500' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500' },
    info: { icon: Info, color: 'text-blue-500' },
};

const RecentAlerts: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Central de Alertas Recentes</CardTitle>
                </div>
                <CardDescription>Últimos eventos importantes da frota.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[30vh] overflow-auto">
               {placeholderAlerts.map(alert => {
                   const config = alertConfig[alert.level];
                   return (
                        <div key={alert.id} className="flex items-start gap-3 p-2 rounded-md border bg-background">
                            <config.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                            <div>
                                <p className="text-sm font-medium">{alert.description}</p>
                                <p className="text-xs text-muted-foreground">{alert.time}</p>
                            </div>
                        </div>
                   )
               })}
            </CardContent>
        </Card>
    );
};

export default RecentAlerts;
