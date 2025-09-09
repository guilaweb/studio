
"use client";

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { withAuth, useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/data';
import PaymentDialog from '@/components/admin/faturacao/payment-dialog';
import { useToast } from '@/hooks/use-toast';
import { changeSubscriptionPlan } from '@/services/subscription-service';
import { useSubscriptionPlans } from '@/services/plans-service';

function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const planId = searchParams.get('plan');
  const { subscriptionPlans, loading: loadingPlans } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  
  useEffect(() => {
    if (!loadingPlans && planId) {
      const plan = subscriptionPlans.find(p => p.id === planId);
      setSelectedPlan(plan || null);
    }
  }, [loadingPlans, planId, subscriptionPlans]);


  if (loadingPlans) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Plano inválido ou não especificado.</p>
      </div>
    );
  }
  
  const handleConfirmPayment = async () => {
    if (!profile?.organizationId || !selectedPlan) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Organização ou plano inválido.' });
        return;
    }
    
    setIsProcessing(true);
    setIsPaymentDialogOpen(false); // Close the dialog immediately
    try {
        await changeSubscriptionPlan(profile.organizationId, selectedPlan);
        toast({ title: 'Pagamento Confirmado!', description: `A sua subscrição foi atualizada para o plano ${selectedPlan.name}.` });
        router.push('/admin/faturacao');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro no Pagamento', description: 'Não foi possível processar a sua subscrição.' });
        setIsProcessing(false);
    }
  }

  return (
    <>
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
                      <span className="text-2xl font-bold">AOA {selectedPlan.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mês</span></span>
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                      <li>Até {selectedPlan.limits.agents === -1 ? 'ilimitados' : selectedPlan.limits.agents} agentes</li>
                      <li>{selectedPlan.limits.storageGb === -1 ? 'Ilimitado' : `${selectedPlan.limits.storageGb} GB`} de armazenamento</li>
                      <li>{selectedPlan.limits.apiCalls === -1 ? 'Ilimitadas' : `${selectedPlan.limits.apiCalls.toLocaleString()}`} chamadas API/mês</li>
                  </ul>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                  Ao clicar em "Pagar com Segurança", ser-lhe-ão apresentados os dados para concluir a transação por transferência bancária.
              </p>
              <Button className="w-full" size="lg" onClick={() => setIsPaymentDialogOpen(true)} disabled={isProcessing}>
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
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onConfirm={handleConfirmPayment}
        planName={selectedPlan.name}
        isChangingPlan={isProcessing}
      />
    </>
  );
}

export default withAuth(CheckoutPage, ['Administrador']);
