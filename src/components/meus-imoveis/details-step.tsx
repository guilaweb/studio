
"use client";

import React from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyTypeEnum } from "@/lib/data";
import type { FormData } from './property-registration-wizard';

const formSchema = z.object({
  propertyType: PropertyTypeEnum,
  area: z.coerce.number().min(1, "A área do terreno é obrigatória."),
  builtArea: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  description: z.string().min(10, "Por favor, forneça uma breve descrição."),
});

interface DetailsStepProps {
  onNext: (data: Partial<FormData>) => void;
  onBack: () => void;
  initialData: Record<string, any>;
}

export default function DetailsStep({ onNext, onBack, initialData }: DetailsStepProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: any) => {
    onNext({ details: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Imóvel</Label>
        <Controller
          name="propertyType"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo de imóvel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="land">Terreno Vazio</SelectItem>
                <SelectItem value="house">Casa Térrea</SelectItem>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="villa">Vivenda</SelectItem>
                <SelectItem value="farm">Fazenda</SelectItem>
                <SelectItem value="commercial">Espaço Comercial</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.propertyType && <p className="text-sm text-destructive">{(errors.propertyType.message as string)}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="area">Área do Terreno (m²)</Label>
          <Input id="area" type="number" {...register("area")} />
          {errors.area && <p className="text-sm text-destructive">{errors.area.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="builtArea">Área Construída (m²)</Label>
          <Input id="builtArea" type="number" {...register("builtArea")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Nº de Quartos</Label>
          <Input id="bedrooms" type="number" {...register("bedrooms")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Nº de Casas de Banho</Label>
          <Input id="bathrooms" type="number" {...register("bathrooms")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Imóvel</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message as string}</p>}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
        <Button type="submit">Próximo Passo</Button>
      </div>
    </form>
  );
}
