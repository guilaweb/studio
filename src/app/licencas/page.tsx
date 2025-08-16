
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Building, Upload, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];


function LicencasPage() {
    const { toast } = useToast();
    const { profile } = useAuth();
    const [files, setFiles] = React.useState<File[]>([]);
    const [mapCenter, setMapCenter] = React.useState({ lat: -8.8368, lng: 13.2343 });
    const [mapZoom, setMapZoom] = React.useState(12);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would submit the form data to a backend service.
        console.log("Submitting with location:", mapCenter);
        toast({
            title: "Submissão em Desenvolvimento",
            description: "A sua submissão de licença foi simulada. A funcionalidade completa será implementada brevemente.",
        });
    };

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar ao Mapa</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Gestão de Licenças de Construção
                    </h1>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                        <div className="grid gap-4 md:grid-cols-2">
                             <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Submeter Novo Projeto</CardTitle>
                                    <CardDescription>
                                        Preencha o formulário para iniciar o processo de licenciamento da sua obra.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <div className="space-y-2">
                                            <Label htmlFor="projectName">Nome do Projeto</Label>
                                            <Input id="projectName" placeholder="Ex: Construção de Moradia Unifamiliar" required/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="requesterName">Nome do Requerente</Label>
                                            <Input id="requesterName" value={profile?.displayName || ''} readOnly disabled/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="projectAddress">Morada da Obra</Label>
                                            <Input id="projectAddress" placeholder="Rua, número, código postal e localidade" required/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="projectType">Tipo de Projeto</Label>
                                            <Select required>
                                                <SelectTrigger id="projectType">
                                                    <SelectValue placeholder="Selecione o tipo de obra" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new-build">Construção Nova</SelectItem>
                                                    <SelectItem value="remodel">Remodelação</SelectItem>
                                                    <SelectItem value="expansion">Ampliação</SelectItem>
                                                    <SelectItem value="demolition">Demolição</SelectItem>
                                                    <SelectItem value="other">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <Separator />

                                        <div className="space-y-4 rounded-md border p-4">
                                            <h4 className="text-sm font-semibold">Dados do Arquiteto Responsável</h4>
                                            <div className="space-y-2">
                                                <Label htmlFor="architectName">Nome Completo do Arquiteto</Label>
                                                <Input id="architectName" placeholder="Insira o nome do arquiteto" required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="architectLicense">Nº da Carteira Profissional</Label>
                                                    <Input id="architectLicense" placeholder="Ex: 12345N" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="architectIdCard">Nº do BI</Label>
                                                    <Input id="architectIdCard" placeholder="Ex: 12345678" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="architectNif">NIF</Label>
                                                <Input id="architectNif" placeholder="Ex: 123456789" required />
                                            </div>
                                        </div>
                                        
                                        <Separator />

                                        <div className="space-y-2">
                                            <Label htmlFor="projectDescription">Descrição do Projeto</Label>
                                            <Textarea id="projectDescription" placeholder="Descreva brevemente os trabalhos a realizar." rows={4} required/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="documents">Anexar Documentos</Label>
                                            <Input 
                                                id="documents" 
                                                type="file" 
                                                multiple
                                                onChange={handleFileChange}
                                                className="h-auto p-1"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Anexe plantas, memória descritiva, etc.
                                            </p>
                                            {files.length > 0 && (
                                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                                    {files.map(file => <li key={file.name}>{file.name}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                        <Button type="submit" className="w-full">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Submeter para Aprovação
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                             <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Meus Projetos Submetidos</CardTitle>
                                    <CardDescription>
                                        Acompanhe o estado de aprovação das suas licenças.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                                        <Building className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold">Ainda não submeteu projetos.</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Quando submeter um pedido de licença, poderá acompanhar o seu estado aqui.
                                        </p>
                                </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Localização do Projeto</CardTitle>
                                <CardDescription>
                                    Arraste o mapa para posicionar o pino no local exato da obra.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[500px] p-0 relative">
                                <Map
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                                    onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                    styles={mapStyles}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <MapPin className="text-primary h-10 w-10" />
                                    </div>
                                </Map>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardContent className="pt-6">
                               <p className="text-xs text-muted-foreground">
                                  Necessita de trabalhar com o Sistema Geodésico Nacional? <Link href="/geodesia" className="underline font-semibold">Consulte a nossa página de informação técnica.</Link>
                               </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(LicencasPage);

    