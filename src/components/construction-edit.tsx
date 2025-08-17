
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { PointOfInterest, PointOfInterestUpdate } from "@/lib/data";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { FileText, Loader2, Send, Trash2, Upload } from "lucide-react";
import { usePoints } from "@/hooks/use-points";
import { Label } from "@/components/ui/label";


const formSchema = z.object({
  projectName: z.string().min(5, "O nome do projeto é obrigatório."),
  projectType: z.string({ required_error: "O tipo de projeto é obrigatório." }),
  architectName: z.string().min(3, "O nome do arquiteto é obrigatório."),
  projectDescription: z.string().min(10, "A descrição é obrigatória."),
});

type ConstructionEditProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConstructionEdit: (id: string, data: Partial<PointOfInterest>) => void;
  poiToEdit: PointOfInterest | null;
};

export default function ConstructionEdit({ 
    open, 
    onOpenChange, 
    onConstructionEdit,
    poiToEdit
}: ConstructionEditProps) {
    const { toast } = useToast();
    const { profile } = useAuth();
    const [files, setFiles] = React.useState<(File | {name: string, url: string})[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: "",
            projectType: "",
            architectName: "",
            projectDescription: "",
        },
    });

    React.useEffect(() => {
        if (poiToEdit) {
            form.reset({
                projectName: poiToEdit.title,
                projectType: poiToEdit.projectType,
                architectName: poiToEdit.architectName,
                projectDescription: poiToEdit.description,
            });
            setFiles(poiToEdit.files || []);
        }
    }, [poiToEdit, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName));
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!poiToEdit || !profile) return;

        setIsSubmitting(true);

        // This is a placeholder for real file upload logic.
        // In a real app, you'd upload new files to Firebase Storage, get URLs,
        // and combine them with existing file URLs.
        const uploadedFiles = files.map(file => {
            if (file instanceof File) {
                return { name: file.name, url: `https://storage.googleapis.com/your-bucket/${file.name}` };
            }
            return file;
        });
        
        const updatedData: Partial<PointOfInterest> = {
            title: values.projectName,
            projectType: values.projectType,
            architectName: values.architectName,
            description: values.projectDescription,
            files: uploadedFiles,
        };

        try {
            await onConstructionEdit(poiToEdit.id, updatedData);
            toast({
                title: "Projeto Atualizado",
                description: "As alterações no seu projeto foram guardadas com sucesso.",
            });
            onOpenChange(false);
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Erro ao Atualizar",
                description: "Não foi possível guardar as alterações do projeto.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl w-full flex flex-col">
                <SheetHeader>
                    <SheetTitle>Editar Pedido de Licença</SheetTitle>
                    <SheetDescription>
                        Corrija os dados do seu projeto ou adicione novos documentos. As alterações serão registadas no histórico.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto pr-6 pl-1 py-4">
                    <Form {...form}>
                        <form id="edit-construction-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <fieldset disabled={!poiToEdit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Nº do Processo</Label>
                                    <Input value={poiToEdit?.id || ''} readOnly disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Requerente</Label>
                                    <Input value={profile?.displayName || ''} readOnly disabled />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="projectName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Projeto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Construção de Moradia Unifamiliar" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="projectType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Projeto</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo de obra" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="new-build">Construção Nova</SelectItem>
                                                    <SelectItem value="remodel">Remodelação</SelectItem>
                                                    <SelectItem value="expansion">Ampliação</SelectItem>
                                                    <SelectItem value="demolition">Demolição</SelectItem>
                                                    <SelectItem value="other">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />
                                
                                <h4 className="text-sm font-semibold">Dados do Arquiteto Responsável</h4>
                                <FormField
                                    control={form.control}
                                    name="architectName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome Completo do Arquiteto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Insira o nome do arquiteto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="projectDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição do Projeto</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Descreva brevemente os trabalhos a realizar." rows={4} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Documentos do Projeto</h3>
                                    <div className="space-y-3">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        {files.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum ficheiro anexado.</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="documents-upload">Adicionar mais documentos</Label>
                                        <Input 
                                            id="documents-upload" 
                                            type="file" 
                                            multiple
                                            onChange={handleFileChange}
                                            className="h-auto p-1"
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </form>
                    </Form>
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit" form="edit-construction-form" disabled={isSubmitting || !poiToEdit}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Guardar Alterações
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
