
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
import { QueueTime, queueTimeLabelMap } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface AtmNoteReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes: number[], queueTime?: QueueTime) => void;
}

const availableNotes = [
    { id: '500', label: '500 Kz' },
    { id: '1000', label: '1000 Kz' },
    { id: '2000', label: '2000 Kz' },
    { id: '5000', label: '5000 Kz' },
];

const queueTimeOptions: { id: QueueTime, label: string }[] = [
    { id: 'none', label: 'Sem fila' },
    { id: 'short', label: 'Curta (até 5 pessoas)' },
    { id: 'medium', label: 'Média (5-10 pessoas)' },
    { id: 'long', label: 'Longa (+10 pessoas)' },
];


export default function AtmNoteReport({ open, onOpenChange, onConfirm }: AtmNoteReportProps) {
    const [selectedNotes, setSelectedNotes] = React.useState<number[]>([]);
    const [selectedQueueTime, setSelectedQueueTime] = React.useState<QueueTime | undefined>();

    const handleCheckedChange = (noteValue: number, checked: boolean) => {
        setSelectedNotes(prev => {
            if (checked) {
                return [...prev, noteValue];
            } else {
                return prev.filter(n => n !== noteValue);
            }
        });
    }

    const handleConfirm = () => {
        onConfirm(selectedNotes, selectedQueueTime);
        onOpenChange(false);
    }
    
    React.useEffect(() => {
        if (!open) {
            setSelectedNotes([]);
            setSelectedQueueTime(undefined);
        }
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Como está o Multicaixa?</AlertDialogTitle>
                <AlertDialogDescription>
                    A sua contribuição ajuda toda a comunidade. Esta informação é opcional.
                </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-2 space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Quais notas conseguiu levantar?</h4>
                         <div className="grid grid-cols-2 gap-4">
                            {availableNotes.map((note) => (
                                <div key={note.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={note.id} 
                                        onCheckedChange={(checked) => handleCheckedChange(parseInt(note.id), checked as boolean)}
                                        checked={selectedNotes.includes(parseInt(note.id))}
                                    />
                                    <Label htmlFor={note.id} className="text-sm font-medium">{note.label}</Label>
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
                                    <RadioGroupItem value={option.id} id={option.id} />
                                    <Label htmlFor={option.id}>{option.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                </div>

                <AlertDialogFooter>
                <AlertDialogCancel>Saltar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>Confirmar Disponibilidade</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


    