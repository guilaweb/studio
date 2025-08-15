"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useState } from "react";
import { PointOfInterest } from "@/lib/data";

const formSchema = z.object({
  title: z.string().min(1, "O tipo de incidência é obrigatório."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres.")
});

type IncidentReportProps = {
  onIncidentSubmit: (incident: Omit<PointOfInterest, 'id' | 'type'>) => void;
};

export default function IncidentReport({ onIncidentSubmit }: IncidentReportProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // For now, we use a random position around Luanda. In a real app, you'd get this from the map.
    const randomPosition = {
        lat: -8.8368 + (Math.random() - 0.5) * 0.1,
        lng: 13.2343 + (Math.random() - 0.5) * 0.1,
    }
    onIncidentSubmit({...values, position: randomPosition});
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Reportar Incidência</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reportar uma incidência</DialogTitle>
          <DialogDescription>
            Ajude a sua cidade. Descreva a incidência que encontrou.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Incidência</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de incidência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Acidente de Trânsito">Acidente de Trânsito</SelectItem>
                      <SelectItem value="Buraco na via">Buraco na via</SelectItem>
                      <SelectItem value="Semáforo com defeito">Semáforo com defeito</SelectItem>
                       <SelectItem value="Iluminação pública com defeito">Iluminação pública com defeito</SelectItem>
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a incidência com o máximo de detalhes possível."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Reportar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
