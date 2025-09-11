
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/data';
import PaymentDialog from '@/components/admin/faturacao/payment-dialog';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionPlans } from '@/services/plans-service';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const planId = searchParams.get('plan');
  const { subscriptionPlans, loading: loadingPlans } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
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
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
             <CardHeader>
                <CardTitle>Plano Inválido</CardTitle>
                <CardDescription>O plano selecionado não foi encontrado.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/planos">Ver Planos Disponíveis</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setIsPaymentDialogOpen(false);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({ title: 'Pagamento Confirmado!', description: `Pode agora concluir o registo para o plano ${selectedPlan.name}.` });

    // Redirect to the registration page with the selected plan
    router.push(`/register?plan=${selectedPlan.id}&cycle=${billingCycle}`);
  }

  const annualPrice = selectedPlan.priceAnnual ?? selectedPlan.price * 10;
  const priceToPay = billingCycle === 'annual' ? annualPrice : selectedPlan.price;
  const monthlyPriceIfAnnual = billingCycle === 'annual' ? (annualPrice / 12) : selectedPlan.price;
  const isFreePlan = selectedPlan.price === 0;

  return (
    <>
      <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Finalizar Compra</CardTitle>
            <CardDescription>Está a subscrever o plano {selectedPlan.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-background">
                  <div className="flex justify-between items-baseline mb-4">
                      <span className="text-lg font-semibold">{selectedPlan.name}</span>
                      {!isFreePlan && (
                        <Tabs defaultValue="monthly" onValueChange={(value) => setBillingCycle(value as any)} className="w-auto">
                            <TabsList>
                                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                                <TabsTrigger value="annual">Anual</TabsTrigger>
                            </TabsList>
                        </Tabs>
                      )}
                  </div>
                  <div className="text-center bg-muted/50 p-4 rounded-md">
                      <p className="text-3xl font-bold">
                        {isFreePlan ? 'Grátis' : `AOA ${priceToPay.toLocaleString()}`}
                        {!isFreePlan && <span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'annual' ? 'ano' : 'mês'}</span>}
                      </p>
                      {billingCycle === 'annual' && !isFreePlan && (
                          <p className="text-xs text-green-600 font-semibold">Equivalente a AOA {monthlyPriceIfAnnual.toLocaleString(undefined, {maximumFractionDigits: 0})}/mês - Poupe até {(((selectedPlan.price * 12) - annualPrice) / (selectedPlan.price * 12) * 100).toFixed(0)}%!</p>
                      )}
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                      <li>Até {selectedPlan.limits.agents === -1 ? 'ilimitados' : selectedPlan.limits.agents} agentes</li>
                      <li>{selectedPlan.limits.storageGb === -1 ? 'Ilimitado' : `${selectedPlan.limits.storageGb} GB`} de armazenamento</li>
                      <li>{selectedPlan.limits.apiCalls === -1 ? 'Ilimitadas' : `${selectedPlan.limits.apiCalls.toLocaleString()}`} chamadas API/mês</li>
                  </ul>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                  {isFreePlan 
                    ? "Clique em 'Continuar' para criar a sua conta gratuita."
                    : 'Ao clicar em "Pagar com Segurança", ser-lhe-ão apresentados os dados para concluir a transação por transferência bancária.'}
              </p>
              <Button className="w-full" size="lg" onClick={() => isFreePlan ? router.push(`/register?plan=free`) : setIsPaymentDialogOpen(true)} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  {isProcessing ? 'A Processar...' : (isFreePlan ? 'Continuar para o Registo' : 'Pagar com Segurança')}
              </Button>
              <Button variant="link" className="w-full" asChild>
                  <Link href="/planos">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar e escolher outro plano
                  </Link>
              </Button>
          </CardContent>
        </Card>
      </div>
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onConfirm={handleConfirmPayment}
        planName={`${selectedPlan.name} (${billingCycle === 'annual' ? 'Anual' : 'Mensal'})`}
        isChangingPlan={isProcessing}
      />
    </>
  );
}

// This is the main page component that wraps the content in Suspense
export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CheckoutPageContent />
        </Suspense>
    )
}
