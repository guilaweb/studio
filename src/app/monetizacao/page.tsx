
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowLeft, Briefcase, Building, DollarSign, Gem, Handshake, Search, Star, TrendingUp } from 'lucide-react';
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

const monetizationOptions = [
    {
        category: "Para o Setor Imobiliário e da Construção",
        features: [
            {
                icon: Star,
                title: "Destaque de Anúncios (Featured Listings)",
                description: "Agentes imobiliários e proprietários podem pagar uma taxa para destacar os seus anúncios de terrenos e imóveis no topo dos resultados de pesquisa no Marketplace, aumentando a visibilidade e acelerando as vendas.",
            },
            {
                icon: Gem,
                title: "Pacotes de Anúncios Premium",
                description: "Oferecer pacotes para múltiplos anúncios a um preço reduzido, ideal para agências imobiliárias ou grandes proprietários que necessitam de gerir um portfólio de ativos.",
            },
            {
                icon: Search,
                title: "Acesso a Dados Analíticos do Mercado (Market Insights)",
                description: "Subscrição de um serviço que fornece acesso a dashboards com dados agregados e anonimizados sobre tendências de preços por zona, tempos médios de venda e procura por tipo de imóvel.",
            },
        ]
    },
    {
        category: "Para Empresas e Serviços Locais",
        features: [
            {
                icon: TrendingUp,
                title: "Publicidade Georreferenciada (Geo-Ads)",
                description: "Empresas locais (restaurantes, lojas, etc.) podem comprar espaço publicitário no mapa, exibindo um pin especial ou um banner quando um utilizador explora a sua área de negócio.",
            },
            {
                icon: Briefcase,
                title: "Integração via API para Logística",
                description: "Empresas de entregas ou logística podem pagar por um acesso via API para integrar a funcionalidade de criação e gestão de croquis diretamente nos seus sistemas, otimizando as suas rotas.",
            },
        ]
    },
    {
        category: "Para Entidades Governamentais e Parceiros",
        features: [
            {
                icon: Handshake,
                title: "Licenciamento da Plataforma (SaaS)",
                description: "O modelo principal. Os municípios ou entidades governamentais pagam uma taxa de subscrição (anual ou mensal) para utilizar a MUNITU como a sua plataforma oficial de gestão urbana e interação com o cidadão.",
            },
            {
                icon: Building,
                title: "Módulos Adicionais e Customização",
                description: "Desenvolvimento de módulos específicos para as necessidades de uma entidade (ex: gestão de frotas, licenciamento comercial específico) como um serviço de desenvolvimento pago.",
            },
        ]
    }
];

export default function MonetizationPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                     <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'monetization-map'}
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
                            <span className="font-semibold text-lg">MUNITU - Monetização</span>
                        </Link>
                    </header>

                    <main className="flex-1">
                        <section className="w-full py-12 md:py-24">
                             <div className="container px-4 md:px-6">
                                <Card className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-10 flex flex-col items-center justify-center space-y-4 text-center">
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <DollarSign className="h-8 w-8 text-primary" />
                                        </div>
                                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-primary">
                                            Estratégias de Monetização
                                        </h1>
                                        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                                            A MUNITU foi desenhada com um modelo de negócio flexível e multifacetado, criando valor para todos os participantes do ecossistema urbano.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {monetizationOptions.map((category, index) => (
                             <section key={index} className={`w-full py-12 md:py-24 ${index % 2 === 1 ? 'bg-muted/40' : ''}`}>
                                <div className="container px-4 md:px-6">
                                    <Card className="bg-card/80 backdrop-blur-sm">
                                        <CardContent className="p-10">
                                            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">{category.category}</div>
                                            </div>
                                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                {category.features.map((feature, fIndex) => (
                                                    <Card key={fIndex} className="bg-card/90">
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
                        ))}
                    </main>

                     <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                            <p>&copy; 2024 MUNITU. Todos os direitos reservados.</p>
                            <Link href="/docs" className="underline hover:text-primary">Documentação Técnica</Link>
                            <Link href="/artigo-cientifico" className="underline hover:text-primary">Artigo Científico</Link>
                            <Link href="/funcionalidades" className="underline hover:text-primary">Funcionalidades</Link>
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
