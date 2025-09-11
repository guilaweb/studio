
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LocationStep from "./location-step";
import DetailsStep from "./details-step";
import DocumentsStep from "./documents-step";
import MediaStep from "./media-step";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePoints } from "@/hooks/use-points";
import { PointOfInterest } from "@/lib/data";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | 4;

export type FormData = {
    polygon: google.maps.LatLngLiteral[] | null;
    details: Record<string, any>;
    documents: File[];
    media: File[];
};

export default function PropertyRegistrationWizard() {
    const [step, setStep] = React.useState<Step>(1);
    const { user, profile } = useAuth();
    const { addPoint } = usePoints();
    const [formData, setFormData] = React.useState<FormData>({
        polygon: null,
        details: {},
        documents: [],
        media: [],
    });
    const { toast } = useToast();
    const router = useRouter();

    const progressValue = (step / 4) * 100;

    const handleNext = (data: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
        if (step < 4) {
            setStep(prev => (prev + 1) as Step);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => (prev - 1) as Step);
        }
    };

    const handleSubmit = async (isPublic: boolean) => {
        if (!user || !profile || !formData.polygon) {
            toast({
                variant: "destructive",
                title: "Erro de Submissão",
                description: "Não foi possível submeter o formulário. Verifique se está autenticado e se o polígono foi desenhado.",
            });
            return;
        }

        const centerLat = formData.polygon.reduce((sum, p) => sum + p.lat, 0) / formData.polygon.length;
        const centerLng = formData.polygon.reduce((sum, p) => sum + p.lng, 0) / formData.polygon.length;

        // Simulate file uploads and get URLs/references
        const documentFiles = formData.documents.map(f => ({ name: f.name, url: `https://storage.placeholder.com/docs/${f.name}` }));
        const mediaFiles = formData.media.map(f => ({ name: f.name, url: `https://storage.placeholder.com/media/${f.name}` }));

        const pointToAdd: Omit<PointOfInterest, 'updates'> & { updates: any[] } = {
            id: `land_plot-${Date.now()}`,
            type: 'land_plot',
            title: `Imóvel registado por ${profile.displayName}`,
            description: formData.details.description,
            authorId: user.uid,
            authorDisplayName: profile.displayName,
            position: { lat: centerLat, lng: centerLng },
            polygon: formData.polygon,
            lastReported: new Date().toISOString(),
            status: 'em_verificacao',
            propertyType: formData.details.propertyType,
            area: formData.details.area,
            builtArea: formData.details.builtArea,
            bedrooms: formData.details.bedrooms,
            bathrooms: formData.details.bathrooms,
            isPublic: isPublic, // Set the visibility
            updates: [{
                id: `update-${Date.now()}`,
                text: 'Registo inicial do imóvel submetido para verificação.',
                authorId: user.uid,
                authorDisplayName: profile.displayName,
                timestamp: new Date().toISOString(),
            }],
            files: [...documentFiles, ...mediaFiles],
        };
        
        await addPoint(pointToAdd as any);

        toast({
            title: "Submissão Enviada!",
            description: "O seu imóvel foi submetido para verificação. Será notificado sobre o progresso.",
        });
        router.push('/meus-imoveis');
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <Progress value={progressValue} className="mb-4" />
                <CardTitle>Passo {step}: {getStepTitle(step)}</CardTitle>
                <CardDescription>{getStepDescription(step)}</CardDescription>
            </CardHeader>
            <CardContent>
                {step === 1 && (
                    <LocationStep
                        onNext={handleNext}
                        initialPolygon={formData.polygon}
                    />
                )}
                {step === 2 && (
                    <DetailsStep
                        onNext={handleNext}
                        onBack={handleBack}
                        initialData={formData.details}
                    />
                )}
                {step === 3 && (
                    <DocumentsStep
                        onNext={handleNext}
                        onBack={handleBack}
                        initialFiles={formData.documents}
                        setFormData={setFormData}
                    />
                )}
                {step === 4 && (
                    <MediaStep
                        onBack={handleBack}
                        onSubmit={handleSubmit}
                        initialFiles={formData.media}
                        setFormData={setFormData}
                    />
                )}
            </CardContent>
        </Card>
    );
}

function getStepTitle(step: Step) {
    switch (step) {
        case 1: return "Localização do Imóvel";
        case 2: return "Detalhes do Imóvel";
        case 3: return "Prova de Propriedade";
        case 4: return "Fotos e Submissão";
    }
}

function getStepDescription(step: Step) {
    switch (step) {
        case 1: return "Desenhe o perímetro do seu imóvel diretamente no mapa.";
        case 2: return "Forneça as especificações e características do seu imóvel.";
        case 3: return "Anexe documentos que comprovem a sua posse. É um passo crucial.";
        case 4: return "Carregue fotos e vídeos para o seu anúncio e finalize o registo.";
    }
}
