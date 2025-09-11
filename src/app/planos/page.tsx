
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowLeft, CheckCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { useSubscriptionPlans } from '@/services/plans-service';
import { Skeleton } from '@/components/ui/skeleton';

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];


export default function PlansPage() {
    const { subscriptionPlans, loading: loadingPlans } = useSubscriptionPlans();

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                     <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'plans-map'}
                    />
                </div>
                <div className="relative z-10 flex flex-col flex-1">
                     <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Voltar</span>
                            </Link>
                        </Button>
                        <Link href="/" className="flex items-center justify-center gap-2 ml-4" prefetch={false}>
                            <Logo className="h-6 w-6 text-primary" />
                            <span className="font-semibold text-lg">MUNITU - Planos de Subscrição</span>
                        </Link>
                    </header>

                    <main className="flex-1">
                        <section className="w-full py-12 md:py-24">
                             <div className="container px-4 md:px-6">
                                <Card className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-10 flex flex-col items-center justify-center space-y-4 text-center">
                                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-primary">
                                            Escolha o Plano Ideal para Si
                                        </h1>
                                        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                                            Desde o cidadão individual a grandes municípios, temos um plano que se adapta às suas necessidades.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section className="w-full py-12 md:py-24 bg-muted/40">
                             <div className="container px-4 md:px-6">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {loadingPlans ? (
                                        [...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)
                                    ) : (
                                        subscriptionPlans.map((plan) => (
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
                                                    <Button className="w-full mt-auto" asChild>
                                                        <Link href={`/register?plan=${plan.id}`}>
                                                            <Zap className="mr-2 h-4 w-4"/>
                                                            Selecionar Plano
                                                        </Link>
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )))}
                                </div>
                             </div>
                        </section>
                    </main>

                     <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
                        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
                            <div className="grid gap-2 col-span-2 md:col-span-1">
                                <Link href="/" className="flex items-center gap-2 mb-2" prefetch={false}>
                                    <Logo className="h-6 w-6 text-primary" />
                                    <span className="font-semibold text-lg">MUNITU</span>
                                </Link>
                                <p className="text-sm text-muted-foreground">Você faz a cidade. A plataforma digital que conecta cidadãos, empresas e o município para uma governação transparente e eficiente.</p>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <h3 className="font-semibold">Plataforma</h3>
                                <Link href="/funcionalidades" className="text-muted-foreground hover:text-primary" prefetch={false}>Funcionalidades</Link>
                                <Link href="/exemplos-de-uso" className="text-muted-foreground hover:text-primary" prefetch={false}>Exemplos de Uso</Link>
                                <Link href="/solucoes-empresas" className="text-muted-foreground hover:text-primary" prefetch={false}>Soluções para Empresas</Link>
                                <Link href="/governo" className="text-muted-foreground hover:text-primary" prefetch={false}>Soluções para Governo</Link>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <h3 className="font-semibold">Recursos</h3>
                                <Link href="/docs" className="text-muted-foreground hover:text-primary" prefetch={false}>Documentação Técnica</Link>
                                <Link href="/artigo-cientifico" className="text-muted-foreground hover:text-primary" prefetch={false}>Artigo Científico</Link>
                                <Link href="/planos" className="text-muted-foreground hover:text-primary" prefetch={false}>Planos e Preços</Link>
                                <Link href="/oportunidades" className="text-muted-foreground hover:text-primary" prefetch={false}>Oportunidades</Link>
                                <Link href="/help" className="text-muted-foreground hover:text-primary" prefetch={false}>Ajuda</Link>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <h3 className="font-semibold">Legal</h3>
                                <Link href="/termos-e-condicoes" className="text-muted-foreground hover:text-primary" prefetch={false}>Termos e Condições</Link>
                                <Link href="/politica-de-privacidade" className="text-muted-foreground hover:text-primary" prefetch={false}>Política de Privacidade</Link>
                            </div>
                        </div>
                        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t">
                            <p className="text-xs text-muted-foreground">&copy; 2024 MUNITU. Todos os direitos reservados.</p>
                            <div className="text-xs text-muted-foreground text-center sm:text-right">
                                <p className="font-semibold">Dianguila Empreendimentos, (SU), Lda.</p>
                                <p>NIF: 5001706802 | Matrícula: 39110-23/231102</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </APIProvider>
    );
}

    