
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

type Step = 1 | 2 | 3 | 4;

export type FormData = {
    polygon: google.maps.LatLngLiteral[] | null;
    details: Record<string, any>;
    documents: File[];
    media: File[];
};

export default function PropertyRegistrationWizard() {
    const [step, setStep] = React.useState<Step>(1);
    const [formData, setFormData] = React.useState<FormData>({
        polygon: null,
        details: {},
        documents: [],
        media: [],
    });
    const { toast } = useToast();

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

    const handleSubmit = () => {
        console.log("Final form data:", formData);
        // Here you would typically call a service to submit the data
        toast({
            title: "Submissão Enviada!",
            description: "O seu imóvel foi submetido para verificação. Será notificado sobre o progresso.",
        });
        // Reset or redirect after submission
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
