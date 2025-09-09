
"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubscriptionPlan } from '@/lib/data';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveSubscriptionPlan } from '@/services/plans-service';
import { Textarea } from '@/components/ui/textarea';

interface PlanEditorProps {
  plan: SubscriptionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  id: z.string().min(1, "O ID do plano é obrigatório (ex: free, professional)").regex(/^[a-z0-9-]+$/, "O ID só pode conter letras minúsculas, números e hífenes."),
  name: z.string().min(3, "O nome do plano é obrigatório."),
  description: z.string().min(10, "A descrição é obrigatória."),
  price: z.coerce.number().min(0, "O preço não pode ser negativo."),
  limits: z.object({
      agents: z.coerce.number().min(-1, "O limite de agentes é inválido."),
      storageGb: z.coerce.number().min(-1, "O limite de armazenamento é inválido."),
      apiCalls: z.coerce.number().min(-1, "O limite de chamadas API é inválido."),
  })
});

export default function PlanEditor({ open, onOpenChange, plan }: PlanEditorProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  const isEditing = !!plan;

  React.useEffect(() => {
    if (open) {
        if (plan) {
            form.reset({
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price: plan.price,
                limits: plan.limits,
            });
        } else {
            form.reset({
                id: '',
                name: '',
                description: '',
                price: 0,
                limits: { agents: 0, storageGb: 0, apiCalls: 0 },
            });
        }
    }
  }, [plan, open, form]);

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        const planData: SubscriptionPlan = {
            ...values,
            currency: 'AOA',
            active: plan?.active ?? true,
            features: plan?.features ?? [],
        };
        
        await saveSubscriptionPlan(planData, isEditing);
        toast({ title: 'Plano Guardado!', description: `O plano "${values.name}" foi guardado com sucesso.` });
        onOpenChange(false);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao Guardar', description: 'Não foi possível guardar os dados do plano.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Plano de Subscrição' : 'Novo Plano de Subscrição'}</DialogTitle>
          <DialogDescription>
            Defina os detalhes, preços e limites para este plano.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="id" render={({ field }) => (
              <FormItem><FormLabel>ID do Plano</FormLabel><FormControl><Input placeholder="Ex: professional" {...field} disabled={isEditing} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome do Plano</FormLabel><FormControl><Input placeholder="Ex: Plano Profissional" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Ideal para municípios de média dimensão..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem><FormLabel>Preço (AOA/mês)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

             <h4 className="font-semibold text-lg pt-4 border-t">Limites</h4>
             <p className="text-sm text-muted-foreground -mt-2">Use -1 para ilimitado.</p>

             <div className="grid grid-cols-3 gap-4">
                 <FormField control={form.control} name="limits.agents" render={({ field }) => (
                    <FormItem><FormLabel>Nº Agentes</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="limits.storageGb" render={({ field }) => (
                    <FormItem><FormLabel>Armazenamento (GB)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="limits.apiCalls" render={({ field }) => (
                    <FormItem><FormLabel>Chamadas API</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
             </div>


             <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Plano
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
