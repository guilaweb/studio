
"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { withAuth, useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { planDetails, SubscriptionPlan } from '@/lib/data';
import { changeSubscriptionPlan } from '@/services/subscription-service';
import { useToast } from '@/hooks/use-toast';

function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const plan = searchParams.get('plan') as SubscriptionPlan;
  const [isProcessing, setIsProcessing] = React.useState(false);

  const selectedPlan = planDetails[plan];

  if (!selectedPlan || !plan) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Plano inválido ou não especificado.</p>
      </div>
    );
  }
  
  const handleConfirmPayment = async () => {
    if (!profile?.organizationId) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Organização não encontrada.' });
        return;
    }
    
    setIsProcessing(true);
    try {
        await changeSubscriptionPlan(profile.organizationId, plan);
        toast({ title: 'Pagamento Confirmado!', description: `A sua subscrição foi atualizada para o plano ${selectedPlan.name}.` });
        router.push('/admin/faturacao');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro no Pagamento', description: 'Não foi possível processar a sua subscrição.' });
        setIsProcessing(false);
    }
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirmar Subscrição</CardTitle>
          <CardDescription>Está prestes a subscrever o plano {selectedPlan.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border bg-background">
                <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold">{selectedPlan.name}</span>
                    <span className="text-2xl font-bold">{selectedPlan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></span>
                </div>
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                    {selectedPlan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                           <span>- {feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <p className="text-xs text-center text-muted-foreground">
                Ao clicar em "Pagar com Segurança", será redirecionado para o nosso portal de pagamentos parceiro para concluir a transação.
            </p>
             <Button className="w-full" size="lg" onClick={handleConfirmPayment} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {isProcessing ? 'A Processar...' : `Pagar com Segurança`}
            </Button>
            <Button variant="link" className="w-full" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar e escolher outro plano
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(CheckoutPage, ['Administrador']);
