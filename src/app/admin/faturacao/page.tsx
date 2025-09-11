
"use client";

import * as React from "react";
import { withAuth, useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Zap, Loader2, Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/services/subscription-service";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionPlan, Payment } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import UsageProgressBar from "@/components/usage-progress-bar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayments } from "@/services/payment-service";
import { useRouter } from "next/navigation";
import { useSubscriptionPlans } from "@/services/plans-service";

function BillingPage() {
    const { subscription, usage, loading: loadingSub } = useSubscription();
    const { payments, loading: loadingPayments } = usePayments();
    const { subscriptionPlans, loading: loadingPlans } = useSubscriptionPlans();
    const { profile } = useAuth();
    const router = useRouter();

    const currentPlan = React.useMemo(() => {
        if (!subscription || !subscriptionPlans) return null;
        return subscriptionPlans.find(p => p.id === subscription.planId);
    }, [subscription, subscriptionPlans]);
    
    const otherPlans = React.useMemo(() => {
         if (!subscription || !subscriptionPlans) return [];
         return subscriptionPlans.filter(p => p.id !== subscription.planId);
    }, [subscription, subscriptionPlans]);


    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'active':
            case 'trialing':
                return <Badge className="bg-green-600 hover:bg-green-600">Ativo</Badge>;
            case 'past_due':
            case 'unpaid':
                return <Badge variant="destructive">Pendente</Badge>;
            case 'canceled':
                return <Badge variant="outline">Cancelado</Badge>;
            default:
                return <Badge variant="secondary">N/D</Badge>;
        }
    };
    
    const handlePlanChangeClick = (newPlan: SubscriptionPlan) => {
        router.push(`/faturacao/checkout?plan=${newPlan.id}`);
    };
    
     const handleDownloadInvoice = (payment: Payment) => {
        const invoiceHtml = `
            <html>
                <head><title>Fatura ${payment.id}</title><style>body{font-family:sans-serif;padding:2rem;} h1{color:#111;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background-color:#f2f2f2;}</style></head>
                <body>
                    <h1>Fatura MUNITU</h1>
                    <p><strong>Fatura ID:</strong> ${payment.id}</p>
                    <p><strong>Data:</strong> ${format(new Date(payment.date), "dd/MM/yyyy")}</p>
                    <p><strong>Cliente:</strong> ${profile?.organizationId}</p>
                    <hr/>
                    <table>
                        <thead><tr><th>Descrição</th><th>Valor</th></tr></thead>
                        <tbody><tr><td>${payment.description}</td><td>AOA ${payment.amount.toFixed(2)}</td></tr></tbody>
                    </table>
                    <p style="margin-top:2rem;">Obrigado por usar a MUNITU.</p>
                </body>
            </html>
        `;
        const newWindow = window.open();
        newWindow?.document.write(invoiceHtml);
        newWindow?.document.close();
    };

    const loading = loadingSub || loadingPayments || loadingPlans;

    return (
        <>
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
                            {loading || !currentPlan ? (
                                <Skeleton className="h-48 w-full" />
                            ) : (
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">{currentPlan.name} {getStatusBadge(subscription?.status)}</CardTitle>
                                            <CardDescription>{currentPlan.description}</CardDescription>
                                        </div>
                                        <div className="text-left md:text-right">
                                             <p className="text-3xl font-bold">
                                                AOA {subscription?.billingCycle === 'annual' ? currentPlan.priceAnnual?.toLocaleString() : currentPlan.price.toLocaleString()}
                                                <span className="text-sm font-normal text-muted-foreground">/{subscription?.billingCycle === 'annual' ? 'ano' : 'mês'}</span>
                                            </p>
                                            {subscription && subscription.status !== 'trialing' && <p className="text-xs text-muted-foreground">Renova em {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM, yyyy", { locale: pt })}</p>}
                                            {subscription?.status === 'trialing' && <p className="text-xs text-muted-foreground">O seu período de teste termina em {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM, yyyy", { locale: pt })}</p>}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Até {currentPlan.limits.agents === -1 ? 'ilimitados' : currentPlan.limits.agents} agentes</span></li>
                                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{currentPlan.limits.storageGb === -1 ? 'Ilimitado' : `${currentPlan.limits.storageGb} GB`} de armazenamento</span></li>
                                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{currentPlan.limits.apiCalls === -1 ? 'Ilimitadas' : `${currentPlan.limits.apiCalls.toLocaleString()}`} chamadas API/mês</span></li>
                                        </ul>
                                        <Separator className="my-6" />
                                        <div>
                                            <h4 className="text-md font-semibold mb-4">Utilização dos Recursos</h4>
                                            <div className="space-y-4">
                                                <UsageProgressBar
                                                    label="Agentes Municipais"
                                                    currentValue={usage.agents}
                                                    limit={currentPlan.limits.agents}
                                                />
                                                 <UsageProgressBar
                                                    label="Armazenamento (GB)"
                                                    currentValue={usage.storage}
                                                    limit={currentPlan.limits.storageGb}
                                                />
                                                <UsageProgressBar
                                                    label="Chamadas API (Este Mês)"
                                                    currentValue={usage.apiCalls}
                                                    limit={currentPlan.limits.apiCalls}
                                                />
                                            </div>
                                        </div>
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
                            {otherPlans.map((plan) => (
                                <Card key={plan.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <p className="text-2xl font-bold">AOA {plan.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                                        <CardDescription>{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex flex-col justify-between">
                                        <ul className="space-y-2 text-sm mb-6">
                                           <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Até {plan.limits.agents === -1 ? 'ilimitados' : plan.limits.agents} agentes</span></li>
                                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{plan.limits.storageGb === -1 ? 'Ilimitado' : `${plan.limits.storageGb} GB`} de armazenamento</span></li>
                                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{plan.limits.apiCalls === -1 ? 'Ilimitadas' : `${plan.limits.apiCalls.toLocaleString()}`} chamadas API/mês</span></li>
                                        </ul>
                                        {plan.id === 'enterprise' ? (
                                            <Button className="w-full mt-auto" asChild>
                                                <Link href="/governo/solicitar">
                                                    <Zap className="mr-2 h-4 w-4"/>
                                                    Contactar Vendas
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button 
                                                className="w-full mt-auto" 
                                                onClick={() => handlePlanChangeClick(plan)}
                                            >
                                                <Zap className="mr-2 h-4 w-4"/>
                                                Fazer Upgrade
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Faturação</CardTitle>
                            <CardDescription>Consulte e descarregue as suas faturas anteriores.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="text-right">Valor (AOA)</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingPayments ? (
                                        <TableRow><TableCell colSpan={4} className="text-center"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                    ) : payments.length > 0 ? (
                                        payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{format(new Date(payment.date), "dd MMM, yyyy", { locale: pt })}</TableCell>
                                                <TableCell>{payment.description}</TableCell>
                                                <TableCell className="text-right font-mono">{payment.amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(payment)}>
                                                        <Download className="mr-2 h-3.5 w-3.5" />
                                                        Descarregar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma fatura encontrada.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </main>
            </div>
        </>
    );
}

export default withAuth(BillingPage, ['Administrador', 'Super Administrador']);
