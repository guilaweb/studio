
"use client";

import Link from 'next/link';
import * as React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

const formSchema = z.object({
  entityName: z.string().min(5, "O nome da entidade é obrigatório."),
  entityType: z.enum(["Administração Municipal", "Governo Provincial", "Empresa Pública", "Empresa Privada"]),
  province: z.string().min(1, "A província é obrigatória."),
  municipality: z.string().min(1, "O município é obrigatório."),
  nif: z.string().regex(/^\d{9}$/, "O NIF deve ter 9 dígitos."),
  address: z.string().min(10, "O endereço é obrigatório."),
  contactName: z.string().min(3, "O nome do ponto de contacto é obrigatório."),
  contactRole: z.string().min(3, "O cargo é obrigatório."),
  contactEmail: z.string().email("Por favor, insira um email institucional válido."),
  contactPhone: z.string().min(9, "O telefone é obrigatório."),
  verificationDocument: z.any().refine(file => file?.length == 1, "O documento de verificação é obrigatório."),
});


export default function InstitutionalRequestPage() {
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entityName: "",
            province: "",
            municipality: "",
            nif: "",
            address: "",
            contactName: "",
            contactRole: "",
            contactEmail: "",
            contactPhone: "",
        },
    });
    
    const fileRef = form.register("verificationDocument");

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Placeholder for submission logic
        console.log(values);
        
        toast({
            title: "Solicitação Recebida!",
            description: "A sua solicitação de registo institucional foi enviada com sucesso.",
        });
        
        setIsSubmitted(true);
    };


    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
                 <div className="fixed inset-0 z-0 opacity-20">
                     <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'institutional-request-map'}
                    />
                </div>
                <div className="relative z-10 w-full max-w-4xl my-8">
                     <Card>
                        <CardHeader>
                            <Link href="/governo" className="inline-block mb-4">
                               <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
                            </Link>
                            <CardTitle className="text-3xl">Formulário de Registo Institucional</CardTitle>
                            <CardDescription>
                                Preencha os dados abaixo para solicitar o acesso da sua entidade à plataforma MUNITU.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isSubmitted ? (
                                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                                     <CheckCircle className="h-16 w-16 text-green-500" />
                                     <h2 className="text-2xl font-semibold">Solicitação Enviada com Sucesso!</h2>
                                     <p className="text-muted-foreground max-w-md">
                                        Recebemos a sua solicitação. A nossa equipa irá verificar os dados e entrará em contacto consigo através do e-mail institucional fornecido assim que o processo for concluído.
                                     </p>
                                     <Button asChild>
                                        <Link href="/">Voltar à Página Inicial</Link>
                                     </Button>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Dados da Entidade</h3>
                                            <FormField
                                                control={form.control}
                                                name="entityName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nome Oficial da Entidade</FormLabel>
                                                        <FormControl><Input placeholder="Ex: Administração Municipal de..." {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <div className="grid md:grid-cols-2 gap-4">
                                                 <FormField
                                                    control={form.control}
                                                    name="entityType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel>Tipo de Entidade</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Administração Municipal">Administração Municipal</SelectItem>
                                                                <SelectItem value="Governo Provincial">Governo Provincial</SelectItem>
                                                                <SelectItem value="Empresa Pública">Empresa Pública</SelectItem>
                                                                <SelectItem value="Empresa Privada">Empresa Privada</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                 <FormField
                                                    control={form.control}
                                                    name="nif"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>NIF</FormLabel>
                                                            <FormControl><Input placeholder="000000000" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                             <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Endereço da Sede</FormLabel>
                                                        <FormControl><Input placeholder="Rua, Bairro, Cidade" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <div className="grid md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="province"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel>Província/Estado</FormLabel>
                                                        <FormControl><Input placeholder="Ex: Província X" {...field} /></FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="municipality"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Município/Cidade</FormLabel>
                                                            <FormControl><Input placeholder="Ex: Município Y" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Dados do Ponto de Contacto</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="contactName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nome Completo</FormLabel>
                                                            <FormControl><Input {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="contactRole"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Cargo</FormLabel>
                                                            <FormControl><Input placeholder="Ex: Chefe de Secretaria" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                             <div className="grid md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="contactEmail"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>E-mail Institucional</FormLabel>
                                                            <FormControl><Input type="email" placeholder="contacto@suaentidade.gov.ao" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="contactPhone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Telefone</FormLabel>
                                                            <FormControl><Input type="tel" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <Separator />
                                        
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Verificação da Entidade</h3>
                                            <FormField
                                                control={form.control}
                                                name="verificationDocument"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Documento de Verificação</FormLabel>
                                                    <FormDescription>Anexe um documento oficial (Ex: Cabeçalho da instituição, alvará) para comprovar a legitimidade da sua entidade. (PDF, JPG, PNG)</FormDescription>
                                                    <FormControl>
                                                        <Input type="file" {...fileRef} accept=".pdf,.jpg,.jpeg,.png" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                        </div>
                                        
                                        <Button type="submit" size="lg">Enviar Solicitação</Button>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </APIProvider>
    );
}
