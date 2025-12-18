
"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/services/user-service';
import { usePoints } from '@/hooks/use-points';
import { useInventory, updatePartStock } from '@/services/inventory-service';
import { PointOfInterest, PointOfInterestStatus, priorityLabelMap } from '@/lib/data';
import { Loader2, Save, Plus, Trash2, Car } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MaintenanceOrderEditorProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    order: PointOfInterest | null;
}

const MaintenanceOrderEditor: React.FC<MaintenanceOrderEditorProps> = ({ isOpen, onOpenChange, order }) => {
    const { users } = useUsers();
    const { addPoint, updatePointDetails } = usePoints();
    const { inventory } = useInventory();
    const { toast } = useToast();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<PointOfInterestStatus>('unknown');
    const [priority, setPriority] = useState<PointOfInterest['priority']>('medium');
    const [vehicleId, setVehicleId] = useState('');
    const [partsCost, setPartsCost] = useState<number | string>('');
    const [laborCost, setLaborCost] = useState<number | string>('');
    const [partsUsed, setPartsUsed] = useState<{ partId: string; quantity: number }[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (order) {
            setTitle(order.title);
            setDescription(order.description);
            setStatus(order.status as PointOfInterestStatus);
            setPriority(order.priority);
            setVehicleId(order.maintenanceId?.split('-')[0] || '');
            setPartsCost(order.partsCost || '');
            setLaborCost(order.laborCost || '');
            setPartsUsed(order.updates?.find(u => u.partsUsed)?.partsUsed?.map(p => ({partId: p.partId, quantity: p.quantity})) || []);
        } else {
            // Reset form for new order
            setTitle('');
            setDescription('');
            setStatus('unknown');
            setPriority('medium');
            setVehicleId('');
            setPartsCost('');
            setLaborCost('');
            setPartsUsed([]);
        }
    }, [order]);

    const handlePartChange = (index: number, partId: string) => {
        const newParts = [...partsUsed];
        newParts[index].partId = partId;
        setPartsUsed(newParts);
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        const newParts = [...partsUsed];
        newParts[index].quantity = Math.max(0, quantity);
        setPartsUsed(newParts);
    };

    const addPartField = () => setPartsUsed([...partsUsed, { partId: '', quantity: 1 }]);
    const removePartField = (index: number) => setPartsUsed(partsUsed.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        if (!title || !vehicleId) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios em falta', description: 'O título e o veículo são necessários.' });
            return;
        }

        setIsSaving(true);
        
        const vehicle = users.find(u => u.uid === vehicleId);
        const totalCost = (Number(partsCost) || 0) + (Number(laborCost) || 0);

        try {
            if (order) { // Editing existing order
                const partsUpdatePromise = partsUsed.map(usedPart => {
                    const originalPartUsage = order.updates?.flatMap(u => u.partsUsed || []).find(p => p.partId === usedPart.partId);
                    const originalQuantity = originalPartUsage?.quantity || 0;
                    const quantityDiff = usedPart.quantity - originalQuantity;
                    
                    if (quantityDiff !== 0) {
                        const inventoryItem = inventory.find(p => p.id === usedPart.partId);
                        if (inventoryItem) {
                            return updatePartStock(usedPart.partId, inventoryItem.stock - quantityDiff);
                        }
                    }
                    return Promise.resolve();
                });

                await Promise.all(partsUpdatePromise);
                
                await updatePointDetails(order.id, {
                    title,
                    description,
                    status,
                    priority,
                    partsCost: Number(partsCost) || 0,
                    laborCost: Number(laborCost) || 0,
                    cost: totalCost,
                    customData: { ...order.customData, vehiclePlate: vehicle?.vehicle?.plate },
                    // partsUsed is stored in updates, so we add a new update
                    updates: [
                        ...order.updates!,
                        {
                            text: `Ordem de serviço atualizada. Estado: ${statusLabelMap[status!]}. Custo total: AOA ${totalCost.toFixed(2)}`,
                            authorId: '', // System ID
                            authorDisplayName: 'Sistema',
                            timestamp: new Date().toISOString(),
                            partsUsed: partsUsed
                        }
                    ]
                });

                toast({ title: 'Ordem de Serviço Atualizada!' });

            } else { // Creating new order
                 const maintenanceId = `${vehicleId}-${Date.now()}`;
                 const newOrder: PointOfInterest = {
                    id: `maintenance-${Date.now()}`,
                    type: 'incident', // We use incident type to store maintenance
                    maintenanceId: maintenanceId,
                    title,
                    description,
                    position: vehicle?.location || { lat: -8.83, lng: 13.23 },
                    authorId: '',
                    authorDisplayName: 'Sistema',
                    lastReported: new Date().toISOString(),
                    status: status,
                    priority: priority,
                    partsCost: Number(partsCost) || 0,
                    laborCost: Number(laborCost) || 0,
                    cost: totalCost,
                    customData: { vehiclePlate: vehicle?.vehicle?.plate },
                    updates: [{
                        id: `update-${Date.now()}`,
                        text: `Ordem de serviço criada. Estado: ${statusLabelMap[status!]}. Custo total: AOA ${totalCost.toFixed(2)}`,
                        authorId: '',
                        authorDisplayName: 'Sistema',
                        timestamp: new Date().toISOString(),
                        partsUsed: partsUsed
                    }]
                };

                // await addPoint(newOrder as any);
                toast({ title: 'Ordem de Serviço Criada!' });
            }
            onOpenChange(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao Guardar', description: 'Não foi possível guardar a ordem de serviço.' });
        } finally {
            setIsSaving(false);
        }
    };

    const fleetVehicles = users.filter(u => u.role === 'Agente Municipal' && u.vehicle);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{order ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
                    <DialogDescription>
                        Gira os detalhes, estado, custos e peças utilizadas para esta manutenção.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Serviço a Executar</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Troca de óleo e filtros" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Descrição / Notas</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais sobre o serviço..." />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="vehicle">Veículo</Label>
                            <Select value={vehicleId} onValueChange={setVehicleId} disabled={!!order}>
                                <SelectTrigger id="vehicle"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {fleetVehicles.map(v => (
                                        <SelectItem key={v.uid} value={v.uid}>{v.vehicle!.plate}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as PointOfInterestStatus)}>
                                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unknown">Pendente</SelectItem>
                                    <SelectItem value="in_progress">Em Oficina</SelectItem>
                                    <SelectItem value="collected">Concluído</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="priority">Prioridade</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as PointOfInterest['priority'])}>
                                <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <Separator />
                    <h4 className="font-semibold">Custos e Peças</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="partsCost">Custo das Peças (AOA)</Label>
                            <Input id="partsCost" type="number" value={partsCost} onChange={e => setPartsCost(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="laborCost">Custo Mão-de-Obra (AOA)</Label>
                            <Input id="laborCost" type="number" value={laborCost} onChange={e => setLaborCost(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Peças Utilizadas (do Inventário)</Label>
                        {partsUsed.map((part, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Select value={part.partId} onValueChange={(v) => handlePartChange(index, v)}>
                                    <SelectTrigger><SelectValue placeholder="Selecione a peça..." /></SelectTrigger>
                                    <SelectContent>
                                        {inventory.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                 <Input 
                                    type="number" 
                                    className="w-24" 
                                    value={part.quantity}
                                    onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                    placeholder="Qtd."
                                />
                                <Button variant="ghost" size="icon" onClick={() => removePartField(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addPartField}><Plus className="mr-2 h-4 w-4"/>Adicionar Peça</Button>
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {order ? 'Guardar Alterações' : 'Criar Ordem'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
