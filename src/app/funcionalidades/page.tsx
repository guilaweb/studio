
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowLeft, CheckCircle, Map, Users, Edit, LayoutDashboard, Briefcase, UserCheck, ShieldCheck, MessageCircle, BarChart3, Building } from 'lucide-react';
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

const citizenFeatures = [
    {
        icon: Map,
        title: "Mapa Interativo Central",
        description: "O coração da MUNITU. Visualize todas as camadas de informação da cidade, desde incidentes a obras e anúncios, num único mapa dinâmico e fácil de navegar."
    },
    {
        icon: Edit,
        title: "Contribuição e Fiscalização Cívica",
        description: "Reporte incidentes, problemas de infraestrutura (buracos, iluminação, saneamento), mapeie pontos de interesse e acompanhe o progresso de obras públicas e privadas."
    },
    {
        icon: Building,
        title: "Marketplace Imobiliário",
        description: "Encontre terrenos e imóveis com um nível de transparência sem precedentes, graças ao 'Painel de Confiança MUNITU' que verifica o estado legal e fiscal de cada propriedade."
    },
    {
        icon: Briefcase,
        title: "Gestão de Ativos Pessoais",
        description: "Registe os seus imóveis, submeta-os ao processo de verificação da MUNITU, acompanhe o estado e gira os seus anúncios no marketplace, tudo num só lugar."
    }
];

const adminFeatures = [
    {
        icon: LayoutDashboard,
        title: "Painel de Gestão Inteligente",
        description: "Uma visão 360º das operações da cidade com dashboards, KPIs em tempo real, mapas de calor, e sumários executivos gerados por IA para apoiar a tomada de decisão."
    },
    {
        icon: ShieldCheck,
        title: "Gestão de Processos e Verificações",
        description: "Analise, aprove ou rejeite processos de licenciamento de construção e pedidos de verificação de imóveis, com o apoio de ferramentas de IA para análise de conformidade."
    },
    {
        icon: Users,
        title: "Gestão de Utilizadores e Permissões",
        description: "Administre todos os utilizadores da plataforma, atribuindo diferentes níveis de permissão (Cidadão, Agente Municipal, Administrador) de forma centralizada."
    },
    {
        icon: MessageCircle,
        title: "Comunicação e Fiscalização",
        description: "Envie anúncios georreferenciados para áreas específicas da cidade e capacite as equipas de campo com ferramentas para fiscalização de obras e gestão de incidentes."
    }
];

export default function FeaturesPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                     <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'features-map'}
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
                            <span className="font-semibold text-lg">MUNITU - Funcionalidades</span>
                        </Link>
                    </header>

                    <main className="flex-1">
                        <section className="w-full py-12 md:py-24 lg:py-32">
                             <div className="container px-4 md:px-6">
                                <Card className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-10 flex flex-col items-center justify-center space-y-4 text-center">
                                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                                            Uma Plataforma, Múltiplas Soluções
                                        </h1>
                                        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                                            Explore os módulos que transformam a MUNITU num ecossistema completo para a governação urbana e participação cívica.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section className="w-full py-12 md:py-24 bg-muted/40">
                            <div className="container px-4 md:px-6">
                                <Card className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-10">
                                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                                            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Para o Cidadão</div>
                                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Capacitando a Participação Cívica</h2>
                                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                                Ferramentas que dão voz ao cidadão e simplificam a sua interação com a cidade.
                                            </p>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {citizenFeatures.map((feature, index) => (
                                                <Card key={index} className="bg-card/90">
                                                    <CardHeader className="flex flex-row items-center gap-4">
                                                        <div className="bg-primary/10 p-3 rounded-full">
                                                            <feature.icon className="w-6 h-6 text-primary" />
                                                        </div>
                                                        <CardTitle>{feature.title}</CardTitle>
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
                                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                                            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Para o Gestor Municipal</div>
                                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ferramentas para uma Gestão Eficiente</h2>
                                             <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                                Módulos desenhados para otimizar operações, aumentar a transparência e responder às necessidades da cidade.
                                             </p>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {adminFeatures.map((feature, index) => (
                                                <Card key={index} className="bg-card/90">
                                                    <CardHeader className="flex flex-row items-center gap-4">
                                                        <div className="bg-primary/10 p-3 rounded-full">
                                                            <feature.icon className="w-6 h-6 text-primary" />
                                                        </div>
                                                        <CardTitle>{feature.title}</CardTitle>
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
                    </main>

                     <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                            <p>&copy; 2024 MUNITU. Todos os direitos reservados.</p>
                            <Link href="/docs" className="underline hover:text-primary">Documentação Técnica</Link>
                            <Link href="/artigo-cientifico" className="underline hover:text-primary">Artigo Científico</Link>
                            <Link href="/exemplos-de-uso" className="underline hover:text-primary">Exemplos de Uso</Link>
                            <Link href="/monetizacao" className="underline hover:text-primary">Monetização</Link>
                            <Link href="/termos-e-condicoes" className="underline hover:text-primary">Termos e Condições</Link>
                            <Link href="/politica-de-privacidade" className="underline hover:text-primary">Política de Privacidade</Link>
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
