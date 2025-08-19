
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { CheckCircle, ArrowRight, BarChart3, Users, Building, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

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

const features = [
    {
        icon: BarChart3,
        title: "Visão Centralizada e Inteligente",
        description: "Acesse um painel de controlo com mapas de calor, clusters de incidentes e dashboards analíticos para uma visão 360º das operações municipais."
    },
    {
        icon: Users,
        title: "Comunicação Direta com o Cidadão",
        description: "Receba reportes georreferenciados, responda a contribuições e envie comunicados oficiais para áreas específicas da cidade."
    },
    {
        icon: Building,
        title: "Otimização de Processos Urbanos",
        description: "Digitalize e acelere a gestão de saneamento, a fiscalização de obras e o licenciamento de projetos, reduzindo a burocracia."
    },
    {
        icon: ShieldCheck,
        title: "Tomada de Decisão Baseada em Dados",
        description: "Utilize a nossa IA para detetar tendências, prever problemas e alocar recursos de forma mais eficiente e proativa."
    }
];

export default function GovernmentSolutionsPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                     <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        styles={mapStyles}
                        mapId={'govt-solutions-map'}
                    />
                </div>
                <div className="relative z-10 flex flex-col flex-1">
                     <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
                        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
                            <Logo className="h-6 w-6 text-primary" />
                            <span className="font-semibold text-lg">MUNITU</span>
                        </Link>
                        <nav className="ml-auto flex gap-4 sm:gap-6">
                           <Button asChild>
                               <Link href="/governo/solicitar" prefetch={false}>
                                    Solicitar Acesso Institucional
                               </Link>
                           </Button>
                        </nav>
                    </header>

                    <main className="flex-1">
                        <section className="w-full py-12 md:py-24 lg:py-32">
                             <div className="container px-4 md:px-6">
                                <Card className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-10 flex flex-col items-center justify-center space-y-4 text-center">
                                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                                            Transforme a Gestão da sua Cidade com a MUNITU
                                        </h1>
                                        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                                            Capacite a sua administração com ferramentas de ponta para uma governação mais eficiente, transparente e colaborativa.
                                        </p>
                                        <div className="mt-6">
                                            <Button size="lg" asChild>
                                                <Link href="/governo/solicitar">
                                                    Solicitar Acesso Institucional <ArrowRight className="ml-2 h-5 w-5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section className="w-full py-12 md:py-24 bg-muted/40">
                            <div className="container px-4 md:px-6">
                                <Card className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-10">
                                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                                            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Funcionalidades</div>
                                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">O Painel Municipal Inteligente</h2>
                                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                                Tudo o que a sua entidade precisa para responder às necessidades da cidade e planear o futuro.
                                            </p>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            {features.map((feature, index) => (
                                                <Card key={index} className="bg-card/90">
                                                    <CardHeader>
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-primary/10 p-3 rounded-full">
                                                                <feature.icon className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <CardTitle>{feature.title}</CardTitle>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-muted-foreground">{feature.description}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section className="w-full py-12 md:py-24">
                             <div className="container px-4 md:px-6">
                                <Card className="bg-card/80 backdrop-blur-sm">
                                     <CardContent className="p-10">
                                        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
                                            <div className="space-y-4">
                                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Planos e Preços</div>
                                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Soluções à Medida da sua Entidade</h2>
                                                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                                    Oferecemos planos flexíveis para municípios, governos provinciais e empresas públicas. Contacte-nos para uma proposta personalizada.
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end">
                                                <Button size="lg" asChild>
                                                    <Link href="/governo/solicitar">
                                                        Solicitar Proposta
                                                    </Link>
                                                </Button>
                                                <Button size="lg" variant="outline" asChild>
                                                    <Link href="/contactos">
                                                        Falar com um Especialista
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>
                    </main>

                     <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                            <p>&copy; 2024 MUNITU. Todos os direitos reservados.</p>
                            <Link href="/docs" className="underline hover:text-primary">Documentação Técnica</Link>
                            <Link href="/funcionalidades" className="underline hover:text-primary">Funcionalidades</Link>
                            <Link href="/exemplos-de-uso" className="underline hover:text-primary">Exemplos de Uso</Link>
                            <Link href="/termos-e-condicoes" className="underline hover:text-primary">Termos e Condições</Link>
                            <Link href="/help" className="underline hover:text-primary">Ajuda</Link>
                        </div>
                        <div className="sm:ml-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground text-center sm:text-right">
                            <div>
                                <p className="font-semibold">Dianguila Empreendimentos, (SU), Lda.</p>
                                <p>NIF: 5001706802 | Matrícula: 39110-23/231102</p>
                                <p>Acto de Constituição: Insc.1 Ap.419/231102</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </APIProvider>
    );
}
