
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, FileText, CheckCircle, Play, MoreVertical, ChevronsUpDown, DollarSign } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { PointOfInterest } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { usePoints } from '@/hooks/use-points';
import { useInventory, updatePartStock } from '@/services/inventory-service';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';


// Task is now a PointOfInterest
export type Task = PointOfInterest;

interface TaskCardProps {
    task: Task;
    onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
    const { toast } = useToast();
    const { updatePointDetails, addUpdateToPoint } = usePoints();
    const { inventory, loading: loadingInventory } = useInventory();
    const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
    const [cost, setCost] = useState<number | string>('');
    const [partsUsed, setPartsUsed] = useState<Record<string, number>>({}); // { partId: quantity }
    const [popoverOpen, setPopoverOpen] = useState(false);

    const priorityVariant = {
        'high': 'destructive',
        'medium': 'default',
        'low': 'secondary',
    } as const;

    const statusBadge = {
        'unknown': <Badge variant="outline">Pendente</Badge>,
        'in_progress': <Badge className="bg-blue-500 text-white">No Local</Badge>,
        'collected': <Badge className="bg-green-500 text-white">Concluída</Badge>,
        'full': <Badge className="bg-orange-500 text-white">Pendente (Cheio)</Badge>,
    };
    
    const handleComplete = () => {
        if (task.maintenanceId) {
            setIsCostDialogOpen(true);
        } else {
            onStatusChange(task.id, 'collected');
            toast({ title: "Tarefa Concluída!", description: `${task.title}` });
        }
    };
    
    const handleCostConfirm = async () => {
        const updatePromises = [];
        
        if (cost) {
            updatePromises.push(updatePointDetails(task.id, { cost: Number(cost) }));
        }

        const partsUsedArray = Object.entries(partsUsed).map(([partId, quantity]) => {
            const part = inventory.find(p => p.id === partId);
            if (part) {
                updatePromises.push(updatePartStock(partId, part.stock - quantity));
            }
            return { partId, name: part?.name, quantity };
        });

        const updateText = `Tarefa concluída. Custo: AOA ${cost || 0}. Peças usadas: ${partsUsedArray.map(p => `${p.quantity}x ${p.name}`).join(', ') || 'Nenhuma'}`;
        updatePromises.push(addUpdateToPoint(task.id, {
            text: updateText,
            authorId: '', // System or logged in user would go here
            authorDisplayName: 'Sistema',
            timestamp: new Date().toISOString(),
            partsUsed: partsUsedArray,
        }));


        try {
            await Promise.all(updatePromises);
            onStatusChange(task.id, 'collected');
            toast({ title: "Tarefa Concluída com Custo e Peças!", description: `${task.title}` });
        } catch(error) {
             toast({ variant: "destructive", title: "Erro ao atualizar", description: "Não foi possível guardar todas as alterações." });
        } finally {
            setIsCostDialogOpen(false);
            setCost('');
            setPartsUsed({});
        }
    };
    
     const handlePartQuantityChange = (partId: string, quantity: number) => {
        setPartsUsed(prev => ({...prev, [partId]: Math.max(0, quantity)}));
    };

    return (
        <>
            <Collapsible>
                <Card>
                    <div className="flex items-center p-4">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                {task.priority && <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>}
                                {statusBadge[task.status as keyof typeof statusBadge] || <Badge variant="secondary">{task.status}</Badge>}
                            </div>
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.description?.substring(0, 50)}...</p>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                Ver Detalhes
                                <ChevronsUpDown className="h-4 w-4 ml-2" />
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <CardContent className="pt-0 pb-4 px-4 space-y-4">
                            <div className="p-3 rounded-md bg-muted text-sm">
                                <p className="font-semibold text-xs text-muted-foreground mb-1">Detalhes da Tarefa</p>
                                {task.description}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {task.status !== 'collected' && (
                                    <Button onClick={handleComplete}>
                                        <CheckCircle className="mr-2 h-4 w-4"/> Marcar como Concluída
                                    </Button>
                                )}
                                <Button variant="outline" asChild>
                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${task.position.lat},${task.position.lng}`} target="_blank" rel="noopener noreferrer">
                                        <Compass className="mr-2 h-4 w-4"/> Navegar
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
             <AlertDialog open={isCostDialogOpen} onOpenChange={setIsCostDialogOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                    <AlertDialogTitle>Concluir Ordem de Serviço</AlertDialogTitle>
                    <AlertDialogDescription>
                        Registe o custo total e as peças utilizadas nesta manutenção.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="maintenance-cost">Custo Total (AOA)</Label>
                            <Input 
                                id="maintenance-cost" 
                                type="number" 
                                value={cost} 
                                onChange={(e) => setCost(e.target.value)} 
                                placeholder="Ex: 15000"
                            />
                        </div>
                        <div className="space-y-2">
                             <Label>Peças Utilizadas</Label>
                             <div className="space-y-2">
                                 {Object.entries(partsUsed).map(([partId, quantity]) => {
                                     const part = inventory.find(p => p.id === partId);
                                     return (
                                        <div key={partId} className="flex items-center gap-2">
                                            <span className="flex-1 text-sm">{part?.name}</span>
                                             <Input 
                                                type="number" 
                                                className="w-20 h-8"
                                                value={quantity}
                                                onChange={(e) => handlePartQuantityChange(partId, Number(e.target.value))}
                                                min="1"
                                            />
                                        </div>
                                     )
                                 })}
                             </div>
                             <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-start mt-2">
                                        Adicionar Peça...
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                     <Command>
                                        <CommandInput placeholder="Pesquisar peça..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhuma peça encontrada.</CommandEmpty>
                                            <CommandGroup>
                                                {inventory.map((part) => (
                                                <CommandItem
                                                    key={part.id}
                                                    onSelect={() => {
                                                        handlePartQuantityChange(part.id, (partsUsed[part.id] || 0) + 1);
                                                        setPopoverOpen(false);
                                                    }}
                                                >
                                                    {part.name} (Stock: {part.stock})
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => { setCost(''); setPartsUsed({}); }}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCostConfirm}>Confirmar e Concluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
