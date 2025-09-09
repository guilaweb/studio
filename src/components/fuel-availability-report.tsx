

"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { QueueTime } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface FuelAvailabilityReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (fuels: string[], queueTime?: QueueTime) => void;
}

const availableFuels = [
    { id: 'gasolina', label: 'Gasolina' },
    { id: 'gasoleo', label: 'Gasóleo' },
];

const queueTimeOptions: { id: QueueTime, label: string }[] = [
    { id: 'none', label: 'Sem fila' },
    { id: 'short', label: 'Curta (até 5 carros)' },
    { id: 'medium', label: 'Média (5-10 carros)' },
    { id: 'long', label: 'Longa (+10 carros)' },
];


export default function FuelAvailabilityReport({ open, onOpenChange, onConfirm }: FuelAvailabilityReportProps) {
    const [selectedFuels, setSelectedFuels] = React.useState<string[]>([]);
    const [selectedQueueTime, setSelectedQueueTime] = React.useState<QueueTime | undefined>();

    const handleCheckedChange = (fuelLabel: string, checked: boolean) => {
        setSelectedFuels(prev => {
            if (checked) {
                return [...prev, fuelLabel];
            } else {
                return prev.filter(f => f !== fuelLabel);
            }
        });
    }

    const handleConfirm = () => {
        onConfirm(selectedFuels, selectedQueueTime);
        onOpenChange(false);
    }
    
    React.useEffect(() => {
        if (!open) {
            setSelectedFuels([]);
            setSelectedQueueTime(undefined);
        }
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Como está o Posto?</AlertDialogTitle>
                <AlertDialogDescription>
                    A sua contribuição ajuda toda a comunidade. Esta informação é opcional.
                </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-2 space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Quais combustíveis estão disponíveis?</h4>
                         <div className="grid grid-cols-2 gap-4">
                            {availableFuels.map((fuel) => (
                                <div key={fuel.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={fuel.id} 
                                        onCheckedChange={(checked) => handleCheckedChange(fuel.label, checked as boolean)}
                                        checked={selectedFuels.includes(fuel.label)}
                                    />
                                    <Label htmlFor={fuel.id} className="text-sm font-medium">{fuel.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                        <h4 className="font-medium mb-2">Como estava a fila?</h4>
                        <RadioGroup onValueChange={(value: QueueTime) => setSelectedQueueTime(value)}>
                             {queueTimeOptions.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.id} id={`q-${option.id}`} />
                                    <Label htmlFor={`q-${option.id}`}>{option.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                </div>

                <AlertDialogFooter>
                <AlertDialogCancel>Saltar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm} disabled={selectedFuels.length === 0}>Confirmar Disponibilidade</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
