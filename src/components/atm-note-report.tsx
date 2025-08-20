
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

interface AtmNoteReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes: number[]) => void;
}

const availableNotes = [
    { id: '500', label: '500 Kz' },
    { id: '1000', label: '1000 Kz' },
    { id: '2000', label: '2000 Kz' },
    { id: '5000', label: '5000 Kz' },
];


export default function AtmNoteReport({ open, onOpenChange, onConfirm }: AtmNoteReportProps) {
    const [selectedNotes, setSelectedNotes] = React.useState<number[]>([]);

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
        onConfirm(selectedNotes);
        onOpenChange(false);
    }
    
    React.useEffect(() => {
        if (!open) {
            setSelectedNotes([]);
        }
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Quais notas conseguiu levantar?</AlertDialogTitle>
                <AlertDialogDescription>
                    A sua contribuição ajuda toda a comunidade. Selecione as notas que o ATM está a dispensar. Esta informação é opcional.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 grid grid-cols-2 gap-4">
                    {availableNotes.map((note) => (
                        <div key={note.id} className="flex items-center space-x-2">
                             <Checkbox 
                                id={note.id} 
                                onCheckedChange={(checked) => handleCheckedChange(parseInt(note.id), checked as boolean)}
                                checked={selectedNotes.includes(parseInt(note.id))}
                            />
                            <Label htmlFor={note.id} className="text-base font-medium">{note.label}</Label>
                        </div>
                    ))}
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel>Saltar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>Confirmar Disponibilidade</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

