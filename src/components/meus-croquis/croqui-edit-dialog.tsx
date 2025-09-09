
"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PointOfInterest } from '@/lib/data';
import { Loader2, Save } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, "O título é obrigatório."),
  collectionName: z.string().optional(),
});

interface CroquiEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  croqui: PointOfInterest;
  onSave: (id: string, title: string, collectionName: string) => Promise<void>;
}

export default function CroquiEditDialog({ open, onOpenChange, croqui, onSave }: CroquiEditDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: croqui.title,
      collectionName: croqui.collectionName || '',
    },
  });

  React.useEffect(() => {
    if (croqui) {
      form.reset({
        title: croqui.title,
        collectionName: croqui.collectionName || '',
      });
    }
  }, [croqui, form]);

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSave(croqui.id, values.title, values.collectionName || 'Croquis Individuais');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Croqui/POI</DialogTitle>
          <DialogDescription>
            Altere o nome do seu item ou mova-o para outra coleção.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Croqui/POI</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collectionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Coleção</FormLabel>
                  <FormControl>
                    <Input placeholder="Croquis Individuais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
