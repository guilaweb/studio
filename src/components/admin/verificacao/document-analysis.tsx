
"use client";

import React, { useEffect, useState } from 'react';
import { AnalyzePropertyDocumentOutput } from '@/lib/data';
import { analyzePropertyDocumentFlow } from '@/ai/flows/analyze-property-document-flow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileSearch, User, Hash, AreaChart, CircleDot, AlertTriangle, BadgePercent } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

interface DocumentAnalysisProps {
    documentUrl: string;
}

const urlToDataUri = async (url: string): Promise<string> => {
    // This is a temporary solution for the demo. In a real app, you would have a backend
    // endpoint to fetch the image and convert it to a data URI to avoid CORS issues.
    // We are proxying the request through a public CORS proxy.
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(proxyUrl + url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

const AnalysisItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}:</span>
            <span className="text-sm text-foreground">{value}</span>
        </div>
    );
};

const DocumentAnalysis: React.FC<DocumentAnalysisProps> = ({ documentUrl }) => {
    const [analysis, setAnalysis] = useState<AnalyzePropertyDocumentOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!documentUrl) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const dataUri = await urlToDataUri(documentUrl);
                const result = await analyzePropertyDocumentFlow({ documentDataUri: dataUri });
                setAnalysis(result);
            } catch (error) {
                console.error("Failed to fetch document analysis:", error);
                toast({
                    variant: "destructive",
                    title: "Erro de IA",
                    description: "Não foi possível analisar o documento de propriedade.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [documentUrl, toast]);
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <FileSearch className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Análise de Documento (IA)</CardTitle>
                        <CardDescription>Extração automática de dados do primeiro documento anexado.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-4/5" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : !analysis ? (
                    <p className="text-sm text-muted-foreground text-center">A análise do documento não pôde ser concluída.</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold">Informação Extraída</h4>
                            <AnalysisItem icon={User} label="Proprietário" value={analysis.ownerName} />
                            <AnalysisItem icon={Hash} label="Nº de Registo" value={analysis.registrationNumber} />
                            <AnalysisItem icon={AreaChart} label="Área do Lote" value={analysis.plotArea ? `${analysis.plotArea} m²` : undefined} />
                            <AnalysisItem icon={CircleDot} label="Resumo" value={analysis.summary} />
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Avaliação de Confiança</h4>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <Label htmlFor="confidence-score" className="text-sm flex items-center gap-2">
                                        <BadgePercent className="h-4 w-4" />
                                        Índice de Confiança
                                    </Label>
                                    <span className="text-lg font-bold text-primary">{analysis.confidenceScore}%</span>
                                </div>
                                <Progress value={analysis.confidenceScore} id="confidence-score" />
                            </div>
                             {analysis.redFlags && analysis.redFlags.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        Alertas Detetados
                                    </h5>
                                    <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                                        {analysis.redFlags.map((flag, index) => (
                                            <li key={index}>{flag}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DocumentAnalysis;
