
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { withAuth, useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest, PointOfInterestStatus, statusLabelMap } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Download, ExternalLink, FileText, Loader2, MessageSquare, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUserProfile } from "@/services/user-service";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
];

const VerificationControl = ({ property, updatePointStatus, addUpdateToPoint }: { property: PointOfInterest, updatePointStatus: any, addUpdateToPoint: any }) => {
    const { profile } = useAuth();
    const [parecerText, setParecerText] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const handleUpdate = async (status: PointOfInterestStatus, defaultMessage: string) => {
        if (!parecerText.trim()) {
            toast({ variant: "destructive", title: "Parecer em falta", description: "Por favor, escreva um parecer antes de definir o estado."});
            return;
        }
        setIsSubmitting(true);
        try {
            await updatePointStatus(property.id, status);
            const newUpdate = {
                text: `**PARECER TÉCNICO**\n${parecerText}`,
                authorId: profile!.uid,
                authorDisplayName: profile!.displayName,
                timestamp: new Date().toISOString(),
            };
            await addUpdateToPoint(property.id, newUpdate);
            toast({ title: "Verificação Concluída", description: `O estado do imóvel foi atualizado para ${statusLabelMap[status]}.`})
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível guardar o parecer."})
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ação de Verificação</CardTitle>
                <CardDescription>Escreva o seu parecer técnico e defina o nível de verificação do imóvel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="Descreva a sua análise dos documentos e da situação geo-espacial..."
                    value={parecerText}
                    onChange={(e) => setParecerText(e.target.value)}
                    rows={6}
                />
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleUpdate('verificado_ouro', 'Propriedade confirmada com documentos oficiais.')} disabled={isSubmitting}>
                        <ThumbsUp className="mr-2 h-4 w-4" /> Verificar (Ouro)
                    </Button>
                    <Button variant="secondary" onClick={() => handleUpdate('verificado_prata', 'Posse confirmada com base em documentos históricos.')} disabled={isSubmitting}>
                        <Check className="mr-2 h-4 w-4" /> Verificar (Prata)
                    </Button>
                    <Button variant="destructive" onClick={() => handleUpdate('informacao_insuficiente', 'Documentação insuficiente ou conflitos geo-espaciais detectados.')} disabled={isSubmitting}>
                        <ThumbsDown className="mr-2 h-4 w-4" /> Info Insuficiente
                    </Button>
                     {isSubmitting && <Loader2 className="h-6 w-6 animate-spin" />}
                </div>
            </CardContent>
        </Card>
    );
};


function AdminVerificationDetailPage() {
    const params = useParams();
    const propertyId = params.id as string;
    const { allData, loading: loadingPoints, updatePointStatus, addUpdateToPoint } = usePoints();
    const [property, setProperty] = React.useState<PointOfInterest | null>(null);
    const { user: applicant, loading: loadingApplicant } = useUserProfile(property?.authorId || null);

    React.useEffect(() => {
        if (allData.length > 0) {
            const foundProperty = allData.find(p => p.id === propertyId);
            setProperty(foundProperty || null);
        }
    }, [allData, propertyId]);


    if (loadingPoints || loadingApplicant) {
        return <div className="flex min-h-screen items-center justify-center">A carregar detalhes do imóvel...</div>;
    }

    if (!property) {
        return <div className="flex min-h-screen items-center justify-center">Imóvel não encontrado.</div>;
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" asChild>
                        <Link href="/admin/verificacao">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold tracking-tight">{property.title}</h1>
                        <p className="text-sm text-muted-foreground">ID do Processo: {property.id}</p>
                    </div>
                     <Badge variant={property.status === 'em_verificacao' ? 'default' : 'secondary'} className={property.status === 'em_verificacao' ? 'bg-yellow-500' : ''}>
                        {property.status ? statusLabelMap[property.status] : "N/A"}
                    </Badge>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="grid auto-rows-max items-start gap-4 md:col-span-2 lg:col-span-3">
                       <VerificationControl property={property} updatePointStatus={updatePointStatus} addUpdateToPoint={addUpdateToPoint} />
                        <Card>
                            <CardHeader>
                                <CardTitle>Documentos de Prova</CardTitle>
                                <CardDescription>Ficheiros submetidos pelo requerente para verificação.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {property.files && property.files.length > 0 ? (
                                    <div className="space-y-3">
                                        {property.files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                                <div className="flex items-center gap-4">
                                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-semibold">{file.name}</p>
                                                        <p className="text-sm text-muted-foreground">Submetido em {new Date(property.lastReported!).toLocaleDateString('pt-PT')}</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                    Ver Documento <ExternalLink className="ml-2 h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                        Nenhum documento foi submetido para este processo.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                        <Card className="h-[40vh] flex flex-col">
                           <CardHeader>
                                <CardTitle>Localização</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow p-0">
                                <Map
                                    mapId="admin-verification-map"
                                    defaultCenter={property.position}
                                    defaultZoom={15}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                    styles={mapStyles}
                                >
                                    {property.polygon && <Polygon paths={property.polygon} strokeColor="#0000FF" strokeOpacity={0.8} strokeWeight={2} fillColor="#0000FF" fillOpacity={0.35} />}
                                </Map>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Requerente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {applicant && (
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={applicant.photoURL} />
                                            <AvatarFallback>{applicant.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{applicant.displayName}</p>
                                            <p className="text-sm text-muted-foreground">{applicant.email}</p>
                                            <Link href={`/public-profile/${applicant.uid}`} className="text-xs text-primary hover:underline">Ver Perfil Público</Link>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Detalhes do Imóvel</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p><span className="font-semibold">Tipo:</span> {property.propertyType || "Não especificado"}</p>
                                <p><span className="font-semibold">Área do Lote:</span> {property.area ? `${property.area} m²` : "N/A"}</p>
                                <p><span className="font-semibold">Área Construída:</span> {property.builtArea ? `${property.builtArea} m²` : "N/A"}</p>
                                <p><span className="font-semibold">Quartos:</span> {property.bedrooms || "N/A"}</p>
                                <p><span className="font-semibold">Casas de Banho:</span> {property.bathrooms || "N/A"}</p>
                                <Separator className="my-2"/>
                                <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

export default withAuth(AdminVerificationDetailPage, ['Agente Municipal', 'Administrador']);

    