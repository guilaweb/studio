
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileText, Trash2 } from "lucide-react";
import type { FormData } from './property-registration-wizard';

interface DocumentsStepProps {
  onNext: (data: Partial<FormData>) => void;
  onBack: () => void;
  initialFiles: File[];
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function DocumentsStep({ onNext, onBack, initialFiles, setFormData }: DocumentsStepProps) {
  const [files, setFiles] = useState<File[]>(initialFiles);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        setFormData(prev => ({...prev, documents: [...prev.documents, ...newFiles]}));
    }
  };

  const removeFile = (fileName: string) => {
    const newFiles = files.filter(f => f.name !== fileName);
    setFiles(newFiles);
    setFormData(prev => ({...prev, documents: newFiles}));
  };

  const handleNextClick = () => {
    onNext({ documents: files });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="documents" className="text-base font-medium">Documentos de Prova</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Anexe documentos como Título de Concessão, Contrato de Compra e Venda, Declaração da Comissão de Moradores, etc.
        </p>
        <Card className="border-2 border-dashed">
          <CardContent className="p-6 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Arraste e solte os seus ficheiros aqui ou clique para selecionar.</p>
            <Input id="documents" type="file" multiple onChange={handleFileChange} className="sr-only" />
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => document.getElementById('documents')?.click()}>
              Selecionar Ficheiros
            </Button>
          </CardContent>
        </Card>
      </div>

      {files.length > 0 && (
        <div>
          <h3 className="text-base font-medium mb-2">Ficheiros Carregados</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between gap-4 rounded-lg border p-3 bg-muted/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
        <Button onClick={handleNextClick} disabled={files.length === 0}>
            Próximo Passo
        </Button>
      </div>
    </div>
  );
}
