
      
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription, changeSubscriptionPlan } from "@/services/subscription-service";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { planDetails } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { SubscriptionPlan } from "@/lib/data";


function BillingPage() {
    const { subscription, loading } = useSubscription();
    const { profile } = useAuth();
    const { toast } = useToast();
    const [isChangingPlan, setIsChangingPlan] = React.useState<SubscriptionPlan | null>(null);

    const currentPlanKey = subscription?.plan || 'free';
    const currentPlan = planDetails[currentPlanKey as keyof typeof planDetails];

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'active':
            case 'trialing':
                return <Badge className="bg-green-600">Ativo</Badge>;
            case 'past_due':
            case 'unpaid':
                return <Badge variant="destructive">Pendente</Badge>;
            case 'canceled':
                return <Badge variant="outline">Cancelado</Badge>;
            default:
                return <Badge variant="secondary">N/D</Badge>;
        }
    };
    
    const handlePlanChange = async (newPlan: SubscriptionPlan) => {
        if (!profile?.organizationId) {
            toast({ variant: "destructive", title: "Erro", description: "ID da organização não encontrado." });
            return;
        }
        setIsChangingPlan(newPlan);
        try {
            await changeSubscriptionPlan(profile.organizationId, newPlan);
            toast({
                title: "Plano Atualizado!",
                description: `A sua subscrição foi alterada para o plano ${planDetails[newPlan].name}.`,
            });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao Mudar de Plano", description: "Não foi possível atualizar a sua subscrição."});
        } finally {
            setIsChangingPlan(null);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Subscrição e Faturação
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Plano Atual</CardTitle>
                        <CardDescription>Esta é a subscrição atual da sua organização.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-32 w-full" />
                        ) : (
                             <Card className="bg-primary/5 border-primary/20">
                                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">{currentPlan.name} {getStatusBadge(subscription?.status)}</CardTitle>
                                        <CardDescription>{currentPlan.description}</CardDescription>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-3xl font-bold">{currentPlan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                                        {subscription && <p className="text-xs text-muted-foreground">Renova em {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM, yyyy", { locale: pt })}</p>}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {currentPlan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Mudar de Plano</CardTitle>
                        <CardDescription>Escolha o plano que melhor se adapta às necessidades da sua entidade.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(planDetails).filter(([key]) => key !== currentPlanKey).map(([key, plan]) => (
                             <Card key={key} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <p className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-between">
                                     <ul className="space-y-2 text-sm mb-6">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button 
                                        className="w-full mt-auto" 
                                        onClick={() => handlePlanChange(key as SubscriptionPlan)}
                                        disabled={isChangingPlan !== null}
                                    >
                                        {isChangingPlan === key ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        ) : (
                                            <Zap className="mr-2 h-4 w-4"/>
                                        )}
                                        {isChangingPlan === key ? 'A Mudar...' : (key === 'enterprise' ? 'Contactar Vendas' : 'Fazer Upgrade')}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(BillingPage, ['Administrador']);

    