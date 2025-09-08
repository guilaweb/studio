
"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserProfile } from '@/lib/data';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

type UserUpdateHandler = (uid: string, data: Partial<UserProfile>) => Promise<void>;

interface VehicleEditorDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: UserUpdateHandler;
}

const formSchema = z.object({
  type: z.string().min(3, "O tipo de veículo é obrigatório."),
  plate: z.string().min(5, "A matrícula é obrigatória."),
  odometer: z.coerce.number().min(0, "O odómetro não pode ser negativo."),
  lastServiceDate: z.date().optional(),
  lastServiceOdometer: z.coerce.number().optional(),
});

export default function VehicleEditorDialog({ open, onOpenChange, user, onSave }: VehicleEditorDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  React.useEffect(() => {
    if (user?.vehicle) {
      form.reset({
        type: user.vehicle.type || '',
        plate: user.vehicle.plate || '',
        odometer: user.vehicle.odometer || 0,
        lastServiceDate: user.vehicle.lastServiceDate ? new Date(user.vehicle.lastServiceDate) : undefined,
        lastServiceOdometer: user.vehicle.lastServiceOdometer || undefined,
      });
    } else {
        form.reset({
            type: '',
            plate: '',
            odometer: 0,
            lastServiceDate: undefined,
            lastServiceOdometer: undefined,
        });
    }
  }, [user, form]);

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    try {
        await onSave(user.uid, {
            vehicle: {
                ...user.vehicle,
                ...values,
                lastServiceDate: values.lastServiceDate?.toISOString(),
            }
        });
        toast({ title: 'Veículo Atualizado!', description: `Os dados do veículo de ${user.displayName} foram guardados.` });
        onOpenChange(false);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao Guardar', description: 'Não foi possível guardar os dados do veículo.' });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerir Veículo</DialogTitle>
          <DialogDescription>
            Edite as informações do veículo atribuído a {user.displayName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Tipo de Veículo</FormLabel><FormControl><Input placeholder="Ex: Carrinha de Manutenção" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="plate" render={({ field }) => (
                <FormItem><FormLabel>Matrícula</FormLabel><FormControl><Input placeholder="Ex: LD-01-02-AA" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="odometer" render={({ field }) => (
                <FormItem><FormLabel>Odómetro Atual (km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField
                control={form.control}
                name="lastServiceDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data do Último Serviço</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP", { locale: pt }) : <span>Selecione a data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField control={form.control} name="lastServiceOdometer" render={({ field }) => (
                <FormItem><FormLabel>Odómetro do Último Serviço (km)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />

             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Veículo
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
