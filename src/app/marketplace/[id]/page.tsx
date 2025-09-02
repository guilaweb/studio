

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestStatus, propertyTypeLabelMap, statusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BedDouble, Bath, Ruler, FileText, ExternalLink, MessageSquare, ShieldCheck, Shield, ShieldAlert, HelpCircle, CheckCircle, XCircle, Landmark, Map as MapIcon, Leaf, Loader2, Share2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";
import { getPinStyle } from "@/components/map-component";
import { VerificationSeal } from "@/components/marketplace/verification-seal";
import { startConversation } from "@/services/chat-service";
import { useToast } from "@/hooks/use-toast";

const TrustInfoItem = ({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status?: boolean }) => {
    const StatusIcon = status === undefined ? null : (status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />);
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{value}</span>
                {StatusIcon}
            </div>
        </div>
    );
};

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#e8e8e8" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.land_parcel", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fdfdfd" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8f8f8" }] },
    { featureType: "road.local", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4d4d4" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];


export default function MarketplacePropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { profile } = useAuth();
    const { toast } = useToast();
    const propertyId = params.id as string;
    const { allData, loading } = usePoints();
    const [property, setProperty] = React.useState<PointOfInterest | null>(null);
    const [isStartingChat, setIsStartingChat] = React.useState(false);
    
    React.useEffect(() => {
        if (allData.length > 0) {
            const foundProperty = allData.find(p => p.id === propertyId);
            setProperty(foundProperty || null);
        }
    }, [allData, propertyId]);

    const handleContactSeller = async () => {
        if (!property || !profile) return;
        setIsStartingChat(true);
        const result = await startConversation(property, profile);
        if (result.conversationId) {
            router.push(`/inbox/${result.conversationId}`);
        } else if (result.error) {
            toast({
                variant: "destructive",
                title: "Erro ao Iniciar Conversa",
                description: result.error,
            });
        }
        setIsStartingChat(false);
    }
    
    const media = property?.updates?.map(u => u.photoDataUri).filter(Boolean) as string[] || [];
    if (property?.files) {
        property.files.forEach(f => {
            if (f.url.match(/\.(jpeg|jpg|gif|png)$/)) {
                media.push(f.url);
            }
        });
    }

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">A carregar...</div>;
    }

    if (!property) {
        return <div className="flex min-h-screen items-center justify-center">Imóvel não encontrado.</div>;
    }

    const usageTypeMap: Record<string, string> = {
        residential: "Residencial",
        commercial: "Comercial",
        industrial: "Industrial",
        mixed: "Misto",
        other: "Outro",
    }
    
    const nearbyPoints = allData.filter(p => p.id !== property.id && p.type !== 'land_plot');

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/marketplace">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar ao Marketplace</span>
                        </Link>
                    </Button>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6">
                    <div className="mx-auto max-w-5xl">
                        <Card>
                            <CardContent className="p-0">
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {media.length > 0 ? media.map((src, index) => (
                                            <CarouselItem key={index}>
                                                <div className="relative h-96 w-full">
                                                    <Image src={src} alt={`Foto do imóvel ${index + 1}`} layout="fill" objectFit="cover" />
                                                </div>
                                            </CarouselItem>
                                        )) : (
                                            <CarouselItem>
                                                <div className="relative h-96 w-full bg-muted flex items-center justify-center">
                                                    <Image src="https://placehold.co/1200x800.png" alt="Sem imagem" layout="fill" objectFit="cover" data-ai-hint="house placeholder" />
                                                </div>
                                            </CarouselItem>
                                        )}
                                    </CarouselContent>
                                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                                </Carousel>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-6 mt-6">
                            <div className="md:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-3xl">{property.title}</CardTitle>
                                                <CardDescription>{property.propertyType ? propertyTypeLabelMap[property.propertyType] : 'Imóvel'}</CardDescription>
                                            </div>
                                            {property.sustainableSeal && (
                                                 <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-2 p-2 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                                                <Leaf className="h-5 w-5" />
                                                                <span className="font-semibold text-sm">Selo Sustentável</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Este projeto cumpre com critérios de sustentabilidade MUNITU.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <div className="text-4xl font-bold text-primary pt-2">
                                            {property.price ? `AOA ${property.price.toLocaleString()}` : "Preço a Negociar"}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <h3 className="font-semibold text-lg mb-2">Sobre este imóvel</h3>
                                        <p className="text-muted-foreground">{property.description}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Características</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {property.area && <div className="flex items-center gap-2"><Ruler /><p>Terreno: {property.area} m²</p></div>}
                                        {property.builtArea && <div className="flex items-center gap-2"><Ruler /><p>Construção: {property.builtArea} m²</p></div>}
                                        {property.bedrooms && <div className="flex items-center gap-2"><BedDouble /><p>{property.bedrooms} Quartos</p></div>}
                                        {property.bathrooms && <div className="flex items-center gap-2"><Bath /><p>{property.bathrooms} Casas de Banho</p></div>}
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle>Localização e Vizinhança</CardTitle></CardHeader>
                                    <CardContent className="h-[400px] p-0">
                                         <Map
                                            mapId="property-detail-map"
                                            defaultCenter={property.position}
                                            defaultZoom={15}
                                            gestureHandling={'greedy'}
                                            disableDefaultUI={true}
                                            styles={mapStyles}
                                        >
                                            <AdvancedMarker position={property.position} zIndex={1000}>
                                                <Pin background={"hsl(var(--primary))"} glyphColor={"hsl(var(--primary-foreground))"} borderColor={"hsl(var(--primary))"} />
                                            </AdvancedMarker>
                                            {nearbyPoints.map(p => (
                                                <AdvancedMarker key={p.id} position={p.position} title={p.title}>
                                                     <Pin {...getPinStyle(p)} />
                                                </AdvancedMarker>
                                            ))}
                                        </Map>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Documentos de Prova</CardTitle></CardHeader>
                                    <CardContent>
                                        {property.files && property.files.length > 0 ? (
                                            <div className="space-y-2">
                                                {property.files.map((file, index) => (
                                                    <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                                        <FileText className="h-6 w-6 text-primary" />
                                                        <span className="text-sm font-medium underline">{file.name}</span>
                                                        <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Nenhum documento de prova foi anexado publicamente.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                    <CardHeader><CardTitle className="text-blue-800 dark:text-blue-300">Painel de Confiança MUNITU</CardTitle></CardHeader>
                                    <CardContent className="space-y-2">
                                        <VerificationSeal status={property.status || 'Privado'} />
                                        <Separator className="my-4 bg-blue-200 dark:bg-blue-800" />
                                        <TrustInfoItem 
                                            icon={<FileText className="h-5 w-5 text-blue-600"/>} 
                                            label="Imposto Predial" 
                                            value={property.propertyTaxStatus === 'paid' ? 'Em Dia' : 'Com Pendências'} 
                                            status={property.propertyTaxStatus === 'paid'}
                                        />
                                        <TrustInfoItem 
                                            icon={<MapIcon className="h-5 w-5 text-blue-600"/>} 
                                            label="Sobreposição" 
                                            value={"Sem conflitos"} 
                                            status={true} // Placeholder
                                        />
                                        {property.usageType && (
                                            <TrustInfoItem 
                                                icon={<Landmark className="h-5 w-5 text-blue-600"/>} 
                                                label="Uso Permitido" 
                                                value={statusLabelMap[property.usageType as keyof typeof statusLabelMap] || property.usageType}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Contactar Vendedor</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {property.croquiId && (
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href={`/croquis/${property.croquiId}`} target="_blank">
                                                    <Share2 className="mr-2 h-4 w-4" /> Ver Croqui de Acesso
                                                </Link>
                                            </Button>
                                        )}
                                        <p className="text-sm text-muted-foreground">Contacte o proprietário para mais informações ou para agendar uma visita.</p>
                                        <Button className="w-full" onClick={handleContactSeller} disabled={isStartingChat}>
                                            {isStartingChat ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquare className="mr-2 h-4 w-4" />}
                                            {isStartingChat ? "A iniciar conversa..." : "Enviar Mensagem"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

    