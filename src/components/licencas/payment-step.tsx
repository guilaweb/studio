
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';

interface PaymentStepProps {
    projectData: Record<string, any>;
    isSubmitting: boolean;
}

const calculateFees = (projectData: Record<string, any>): number => {
    let fees = 5000; // Base fee in Kz
    switch (projectData.projectType) {
        case 'new-build':
            fees += 15000;
            break;
        case 'remodel':
            fees += 7500;
            break;
        case 'expansion':
            fees += 10000;
            break;
        case 'demolition':
            fees += 5000;
            break;
        default:
            fees += 2000;
    }
    // Simple logic to add fee based on floors mentioned in description
    const floorMatch = projectData.projectDescription?.match(/(\d+)\s+andares/);
    if (floorMatch) {
        const numFloors = parseInt(floorMatch[1], 10);
        fees += numFloors * 2000;
    }
    return fees;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ projectData, isSubmitting }) => {
    const fees = calculateFees(projectData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Passo 5: Pagamento de Taxas</CardTitle>
                <CardDescription>
                    Reveja as taxas calculadas e proceda ao pagamento para formalizar a sua submissão.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Taxa de Submissão Inicial</span>
                        <span className="font-bold text-lg">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(fees)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Este é um valor de exemplo. Taxas adicionais podem ser aplicadas durante a análise do processo.
                    </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Pagar Taxa e Submeter Projeto (Simulação)
                </Button>
            </CardContent>
        </Card>
    );
};

export default PaymentStep;

    