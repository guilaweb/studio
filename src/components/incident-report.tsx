
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { PointOfInterest } from "@/lib/data";

const formSchema = z.object({
  title: z.string().min(1, "O tipo de incidente é obrigatório."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres.")
});

type IncidentReportProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncidentSubmit: (incident: Omit<PointOfInterest, 'id' | 'type' | 'authorId' | 'position'>, type?: PointOfInterest['type']) => void;
};

export default function IncidentReport({ open, onOpenChange, onIncidentSubmit }: IncidentReportProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isSanitation = values.title === 'Contentor de lixo';
    const type = isSanitation ? 'sanitation' : 'incident';
    
    onIncidentSubmit(values, type);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>Reportar Incidência</SheetTitle>
          <SheetDescription>
            Localização selecionada. Agora, por favor, forneça os detalhes do que presenciou.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Reporte</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de reporte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Colisão Ligeira">Colisão Ligeira</SelectItem>
                      <SelectItem value="Colisão Grave">Colisão Grave</SelectItem>
                      <SelectItem value="Atropelamento">Atropelamento</SelectItem>
                      <SelectItem value="Acidente de Moto">Acidente de Moto</SelectItem>
                      <SelectItem value="Buraco na via">Buraco na via</SelectItem>
                      <SelectItem value="Semáforo com defeito">Semáforo com defeito</SelectItem>
                      <SelectItem value="Iluminação pública com defeito">Iluminação pública com defeito</SelectItem>
                      <SelectItem value="Contentor de lixo">Mapear Contentor de Lixo</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional: adicione tags como #falta-de-sinalização)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a incidência com detalhes. Ex: Colisão no cruzamento, um dos carros capotou. #trânsitocortado"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Submeter Reporte</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
