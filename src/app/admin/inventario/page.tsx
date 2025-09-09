
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory, addInventoryPart, deleteInventoryPart } from "@/services/inventory-service";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";

function InventoryPage() {
    const { inventory, loading } = useInventory();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newPart, setNewPart] = useState({ name: '', sku: '', stock: 0, cost: 0, supplier: '' });
    const [partToDelete, setPartToDelete] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPart(prev => ({ ...prev, [name]: name === 'stock' || name === 'cost' ? parseFloat(value) || 0 : value }));
    };

    const handleAddPart = async () => {
        if (!newPart.name || newPart.stock <= 0 || newPart.cost <= 0) {
            toast({ variant: "destructive", title: "Dados em Falta", description: "O nome, stock inicial e custo da peça são obrigatórios." });
            return;
        }
        setIsAdding(true);
        try {
            await addInventoryPart(newPart);
            toast({ title: "Peça Adicionada!", description: `${newPart.name} foi adicionado ao inventário.` });
            setNewPart({ name: '', sku: '', stock: 0, cost: 0, supplier: '' });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao Adicionar", description: "Não foi possível adicionar a peça." });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async () => {
        if (!partToDelete) return;
        try {
            await deleteInventoryPart(partToDelete);
            toast({ title: "Peça Removida" });
            setPartToDelete(null);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao Remover" });
        }
    };

    if (loading) {
        return <div>A carregar inventário...</div>;
    }

    return (
        <>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/admin/equipa">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Gestão de Inventário
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Nova Peça</CardTitle>
                            <CardDescription>Registe novas peças e componentes no seu inventário.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-5 gap-4 items-end">
                                <div className="space-y-2"><Label htmlFor="name">Nome da Peça</Label><Input id="name" name="name" value={newPart.name} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label htmlFor="sku">SKU / Ref.</Label><Input id="sku" name="sku" value={newPart.sku} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label htmlFor="stock">Stock Inicial</Label><Input id="stock" name="stock" type="number" value={newPart.stock} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label htmlFor="cost">Custo (AOA)</Label><Input id="cost" name="cost" type="number" value={newPart.cost} onChange={handleInputChange} /></div>
                                <Button onClick={handleAddPart} disabled={isAdding}>
                                    {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Adicionar Peça
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventário Atual</CardTitle>
                            <CardDescription>Lista de todas as peças e componentes em stock.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Peça</TableHead>
                                        <TableHead>SKU/Ref.</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                        <TableHead className="text-right">Custo Unit. (AOA)</TableHead>
                                        <TableHead>Data de Registo</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory.map((part) => (
                                        <TableRow key={part.id}>
                                            <TableCell className="font-medium flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /> {part.name}</TableCell>
                                            <TableCell className="font-mono text-xs">{part.sku || '-'}</TableCell>
                                            <TableCell className="text-right font-bold">{part.stock}</TableCell>
                                            <TableCell className="text-right font-mono">{part.cost.toFixed(2)}</TableCell>
                                            <TableCell>{format(new Date(part.createdAt), "dd/MM/yyyy")}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setPartToDelete(part.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {inventory.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma peça registada no inventário.</p>}
                        </CardContent>
                    </Card>
                </main>
            </div>
            <DeleteConfirmationDialog 
                open={!!partToDelete}
                onOpenChange={setPartToDelete}
                onConfirm={handleDelete}
                itemType="peça do inventário"
            />
        </>
    );
}

export default withAuth(InventoryPage, ['Agente Municipal', 'Administrador']);
