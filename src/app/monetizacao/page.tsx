"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowLeft, Briefcase, Building, DollarSign, Gem, Handshake, Search, Star, TrendingUp, ShieldCheck, AreaChart, Zap } from 'lucide-react';
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
        category: "Para o Setor Imobiliário e da Construção (B2C/B2B)",
        features: [
            {
                icon: Star,
                title: "Destaque de Anúncios (Featured Listings)",
                description: "Proprietários e agentes imobiliários pagam uma taxa para que os seus anúncios apareçam no topo dos resultados de pesquisa do Marketplace, aumentando a visibilidade e acelerando as vendas.",
            },
            {
                icon: ShieldCheck,
                title: "Serviço de Verificação Prioritária",
                description: "Oferecer um serviço 'fast-track' pago para que os proprietários tenham os seus pedidos de verificação de imóveis (Selo Ouro/Prata) analisados com prioridade pelos técnicos municipais.",
            },
            {
                icon: AreaChart,
                title: "Relatórios de Análise Comparativa de Mercado (IA)",
                description: "Venda de relatórios detalhados, gerados por IA, com análise de preços por m², tendências de valorização por bairro e perfis de procura, para apoiar decisões de investimento.",
            },
        ]
    },
    {
        category: "Para Empresas e Serviços Locais (B2B)",
        features: [
             {
                icon: Briefcase,
                title: "Portal de Fornecedores Verificados",
                description: "Oficinas, arquitetos e outros profissionais podem pagar uma subscrição para aparecerem como 'Prestadores Verificados MUNITU', ganhando acesso a pedidos de cotação de frotas e outros clientes.",
            },
            {
                icon: TrendingUp,
                title: "Publicidade Georreferenciada (Geo-Ads)",
                description: "Empresas locais (restaurantes, lojas, etc.) podem comprar espaço publicitário no mapa, exibindo um pin especial ou um banner quando um utilizador explora a sua área de negócio.",
            },
            {
                icon: Zap,
                title: "Acesso à API para Logística e Entregas",
                description: "Empresas de entregas ou logística podem pagar por um acesso via API para integrar a funcionalidade de criação e gestão de croquis de localização diretamente nos seus sistemas.",
            },
        ]
    },
    {
        category: "Para Entidades Governamentais e Grandes Empresas",
        features: [
            {
                icon: Handshake,
                title: "Licenciamento da Plataforma (SaaS)",
                description: "O modelo principal. Os municípios ou entidades governamentais pagam uma taxa de subscrição para utilizar a MUNITU como a sua plataforma oficial de gestão urbana e interação com o cidadão.",
            },
            {
                icon: Gem,
                title: "Relatórios de Análise de Impacto (IA)",
                description: "Venda de relatórios de impacto ambiental, conformidade de projetos ou análise de risco para grandes empreendimentos, gerados através dos nossos modelos de IA.",
            },
             {
                icon: Building,
                title: "Módulos Customizados e Acesso API Premium",
                description: "Desenvolvimento de módulos específicos (ex: gestão de frotas) ou licenciamento de acesso à API para integração com sistemas de ERP e Business Intelligence.",
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
                                                        <CardHeader className="flex flex-row items-start gap-4">
                                                            <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
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
                            <Link href="/oportunidades" className="underline hover:text-primary">Oportunidades</Link>
                            <Link href="/solucoes-empresas" className="underline hover:text-primary">Soluções para Empresas</Link>
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
