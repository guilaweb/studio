
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { useUsers } from "@/services/user-service";
import { addFuelEntry, useFuelEntries } from "@/services/fuel-service";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Fuel, Loader2, Calendar as CalendarIcon, Car } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FuelEntry } from "@/lib/data";

const formSchema = z.object({
  vehicleId: z.string({ required_error: "É obrigatório selecionar um veículo." }),
  date: z.date({ required_error: "A data é obrigatória." }),
  liters: z.coerce.number().positive("Os litros devem ser um número positivo."),
  cost: z.coerce.number().positive("O custo deve ser um número positivo."),
  odometer: z.coerce.number().positive("O odómetro deve ser um número positivo."),
});

function FuelLogPage() {
    const { users, loading: loadingUsers } = useUsers();
    const { fuelEntries, loading: loadingEntries } = useFuelEntries();
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            vehicleId: '',
            liters: '' as any,
            cost: '' as any,
            odometer: '' as any,
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const selectedUser = users.find(u => u.uid === values.vehicleId);
        if (!selectedUser || !selectedUser.vehicle) {
            toast({ variant: "destructive", title: "Veículo inválido", description: "O utilizador selecionado não tem um veículo associado." });
            return;
        }

        try {
            await addFuelEntry({
                vehicleId: selectedUser.uid,
                driverName: selectedUser.displayName,
                vehiclePlate: selectedUser.vehicle.plate,
                date: values.date.toISOString(),
                odometer: values.odometer,
                liters: values.liters,
                cost: values.cost,
            });
            toast({ title: "Abastecimento Registado!", description: "O novo registo foi guardado com sucesso." });
            form.reset({ date: new Date(), vehicleId: '', liters: '' as any, cost: '' as any, odometer: '' as any });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao Registar", description: "Não foi possível guardar o registo de abastecimento." });
        }
    };

    const fleetVehicles = React.useMemo(() => {
        return users.filter(u => u.role === 'Agente Municipal' && u.vehicle);
    }, [users]);
    
    if (loadingUsers || loadingEntries) {
        return <div>A carregar dados da frota...</div>
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/admin/equipa">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Gestão de Abastecimentos
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6 md:grid-cols-3">
                <div className="md:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Registar Novo Abastecimento</CardTitle>
                            <CardDescription>Insira os dados do último abastecimento de um veículo da frota.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="vehicleId"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Veículo (Matrícula)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {fleetVehicles.map(v => (
                                                    <SelectItem key={v.uid} value={v.uid}>{v.vehicle!.plate} ({v.displayName})</SelectItem>
                                                ))}
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                            <FormLabel>Data do Abastecimento</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                    variant={"outline"}
                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                    {field.value ? format(field.value, "PPP", { locale: pt }) : <span>Selecione a data</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="liters" render={({ field }) => (<FormItem><FormLabel>Litros</FormLabel><FormControl><Input type="number" step="0.01" placeholder="50.5" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Custo Total (AOA)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="25000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <FormField control={form.control} name="odometer" render={({ field }) => (<FormItem><FormLabel>Odómetro (km)</FormLabel><FormControl><Input type="number" placeholder="125600" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fuel className="mr-2 h-4 w-4" />}
                                        Registar Abastecimento
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                 <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Abastecimentos</CardTitle>
                            <CardDescription>Últimos 20 registos. O histórico completo estará disponível nos relatórios.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Veículo</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead className="text-right">Litros</TableHead>
                                        <TableHead className="text-right">Custo</TableHead>
                                        <TableHead className="text-right">Odómetro</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fuelEntries.slice(0, 20).map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium flex items-center gap-2"><Car className="h-4 w-4 text-muted-foreground"/> {entry.vehiclePlate}</TableCell>
                                            <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                                            <TableCell className="text-right">{entry.liters.toFixed(2)} L</TableCell>
                                            <TableCell className="text-right">AOA {entry.cost.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{entry.odometer} km</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {fuelEntries.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum abastecimento registado.</p>}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default withAuth(FuelLogPage, ['Agente Municipal', 'Administrador']);
