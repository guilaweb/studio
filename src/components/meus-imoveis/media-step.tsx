
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react";
import type { FormData } from './property-registration-wizard';
import Image from 'next/image';

interface MediaStepProps {
  onBack: () => void;
  onSubmit: () => void;
  initialFiles: File[];
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function MediaStep({ onBack, onSubmit, initialFiles, setFormData }: MediaStepProps) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [previews, setPreviews] = useState<string[]>([]);

  React.useEffect(() => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Cleanup object URLs on unmount
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setFormData(prev => ({...prev, media: [...prev.media, ...newFiles]}));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFormData(prev => ({...prev, media: newFiles}));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="media" className="text-base font-medium">Fotos e Vídeos</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Carregue fotos e vídeos atuais do seu imóvel.
        </p>
        <Card className="border-2 border-dashed">
          <CardContent className="p-6 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Arraste e solte os seus ficheiros aqui ou clique para selecionar.</p>
            <Input id="media" type="file" multiple onChange={handleFileChange} className="sr-only" accept="image/*,video/*" />
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => document.getElementById('media')?.click()}>
              Selecionar Ficheiros
            </Button>
          </CardContent>
        </Card>
      </div>

      {previews.length > 0 && (
        <div>
          <h3 className="text-base font-medium mb-2">Pré-visualização</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group aspect-square">
                <Image src={preview} alt={`Preview ${index}`} layout="fill" objectFit="cover" className="rounded-md" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Button variant="destructive" size="icon" onClick={() => removeFile(index)}>
                     <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
        <Button onClick={onSubmit}>
            Submeter para Verificação
        </Button>
      </div>
    </div>
  );
}
