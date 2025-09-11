
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

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
  name: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("Por favor, insira um email válido."),
  entity: z.string().optional(),
  subject: z.string().min(5, "O assunto é obrigatório."),
  message: z.string().min(10, "A sua mensagem é muito curta."),
});


export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", entity: "", subject: "", message: "" },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Placeholder for submission logic (e.g., API call)
        console.log("Contact form submitted:", values);
        
        toast({
            title: "Mensagem Enviada!",
            description: "A sua mensagem foi enviada com sucesso. Entraremos em contacto em breve.",
        });
        
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                 <div className="space-y-4">
                     <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                     <h2 className="text-2xl font-semibold">Mensagem Enviada com Sucesso!</h2>
                     <p className="text-muted-foreground max-w-md">
                        Obrigado por entrar em contacto. A nossa equipa analisará a sua mensagem e responderá o mais breve possível.
                     </p>
                     <Button asChild>
                        <Link href="/">Voltar à Página Inicial</Link>
                     </Button>
                </div>
            </div>
        )
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
                 <div className="fixed inset-0 z-0 opacity-20">
                     <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'contact-page-map'}
                    />
                </div>
                <div className="relative z-10 w-full max-w-2xl my-8">
                     <Card>
                        <CardHeader>
                            <Link href="/" className="inline-block mb-4">
                               <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
                            </Link>
                            <CardTitle className="text-3xl">Fale Connosco</CardTitle>
                            <CardDescription>
                                Tem alguma questão sobre os nossos planos, uma proposta de parceria ou precisa de suporte técnico? Preencha o formulário abaixo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem><FormLabel>O seu Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>O seu Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="entity" render={({ field }) => (
                                        <FormItem><FormLabel>Empresa / Entidade (Opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={form.control} name="subject" render={({ field }) => (
                                        <FormItem><FormLabel>Assunto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="message" render={({ field }) => (
                                        <FormItem><FormLabel>A sua Mensagem</FormLabel><FormControl><Textarea rows={6} {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                                        <Send className="mr-2 h-4 w-4"/> Enviar Mensagem
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </APIProvider>
    );
}
