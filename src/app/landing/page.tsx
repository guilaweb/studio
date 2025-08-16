
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Building, FileText, ArrowRight, UserCheck, BarChart3, Users, CheckCircle, Map, Layers, Siren, Briefcase, FileCheck, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
];


export default function LandingPage() {
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
                    mapId={'landing-map'}
                />
            </div>
        
            <div className="relative z-10 flex flex-col flex-1">
                <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
                    <Link href="#" className="flex items-center justify-center gap-2" prefetch={false}>
                    <Logo className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg">Cidadão Online</span>
                    </Link>
                    <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Button variant="ghost" asChild>
                        <Link href="/login" prefetch={false}>
                        Entrar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register" prefetch={false}>
                        Registar
                        </Link>
                    </Button>
                    </nav>
                </header>

                <main className="flex-1">
                    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                        <div className="container px-4 md:px-6">
                             <Card>
                                <CardContent className="p-10 flex flex-col justify-center space-y-4 text-center">
                                    <div className="space-y-4">
                                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                                            A sua ponte direta com a cidade.
                                        </h1>
                                        <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl">
                                            Participe, reporte, consulte e fiscalize. A plataforma Cidadão Online capacita-o a ter um papel ativo na melhoria da sua comunidade, de forma transparente e eficiente.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                                        <Button asChild size="lg">
                                            <Link href="/register" prefetch={false}>
                                            Junte-se à Comunidade
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                    
                    <section id="for-whom" className="w-full py-12 md:py-24 lg:py-32">
                        <div className="container px-4 md:px-6 space-y-8">
                            <Card>
                                <CardContent className="p-10">
                                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Uma Ferramenta, Dois Mundos</h2>
                                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                            Conectando as necessidades dos cidadãos com a capacidade de resposta do município.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="grid gap-8 md:grid-cols-2">
                                <Card className="p-6">
                                    <CardHeader className="p-0 text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-3 rounded-full">
                                                <Users className="w-8 h-8 text-primary" />
                                            </div>
                                            <CardTitle className="text-2xl">Para o Cidadão</CardTitle>
                                        </div>
                                        <CardDescription className="pt-2">A sua voz, amplificada. O seu impacto, visível.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 mt-6 space-y-4 text-left">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                                            <p><span className="font-semibold">Participe Ativamente:</span> Reporte problemas como buracos na via, falhas de iluminação ou fugas de água em minutos.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                                            <p><span className="font-semibold">Processos Simplificados:</span> Solicite e acompanhe a sua licença de construção de forma 100% digital e transparente.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                                            <p><span className="font-semibold">Fiscalize e Contribua:</span> Acompanhe o andamento de obras públicas e privadas, deixando o seu feedback.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="p-6">
                                    <CardHeader className="p-0 text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-3 rounded-full">
                                                <BarChart3 className="w-8 h-8 text-primary" />
                                            </div>
                                            <CardTitle className="text-2xl">Para o Município</CardTitle>
                                        </div>
                                        <CardDescription className="pt-2">Gestão inteligente, decisões baseadas em dados.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 mt-6 space-y-4 text-left">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                                            <p><span className="font-semibold">Visão 360º da Cidade:</span> Centralize todos os incidentes, obras e pedidos de licença numa única plataforma com visão geoespacial.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                                            <p><span className="font-semibold">Otimização de Recursos:</span> Utilize painéis inteligentes e IA para priorizar incidentes, detetar clusters e otimizar as equipas de campo.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                                            <p><span className="font-semibold">Comunicação Direta:</span> Envie alertas e comunicados georreferenciados para áreas específicas da cidade.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
                        <div className="container px-4 md:px-6 space-y-8">
                            <Card>
                                <CardContent className="p-10">
                                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Funcionalidades Principais</div>
                                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ferramentas para uma Cidade Inteligente</h2>
                                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Explore as ferramentas que colocamos à sua disposição para participar, fiscalizar e gerir a cidade.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full"><Map className="w-6 h-6 text-primary" /></div>
                                        <CardTitle>Mapa Interativo</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Visualize todos os dados da cidade num mapa dinâmico e fácil de usar, desde incidentes a obras.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full"><Layers className="w-6 h-6 text-primary" /></div>
                                        <CardTitle>Gestão de Camadas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Sobreponha diferentes camadas de informação como redes de água, saneamento e zonas de risco.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full"><Siren className="w-6 h-6 text-primary" /></div>
                                        <CardTitle>Reporte de Incidentes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Comunique problemas como buracos, falhas de iluminação ou acidentes de forma rápida e georreferenciada.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full"><Briefcase className="w-6 h-6 text-primary" /></div>
                                        <CardTitle>Acompanhamento de Obras</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Consulte o progresso de obras públicas e privadas, e deixe o seu feedback para fiscalização.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full"><FileCheck className="w-6 h-6 text-primary" /></div>
                                        <CardTitle>Licenciamento Digital</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Submeta e acompanhe o seu processo de licenciamento de construção de forma 100% online.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full"><LayoutDashboard className="w-6 h-6 text-primary" /></div>
                                        <CardTitle>Painel de Gestão</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Dashboards com IA para o município analisar dados, detetar tendências e otimizar operações.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <Card>
                            <CardContent className="p-10">
                                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Como Funciona</div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simples, Rápido e Eficaz</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Em três passos, você começa a transformar a sua cidade.
                                </p>
                                </div>
                                <div className="relative grid gap-10 sm:grid-cols-3">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden sm:block"></div>
                                    <div className="relative flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-card z-10">
                                            <UserCheck className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold mt-4">1. Registe-se</h3>
                                        <p className="text-muted-foreground mt-2">Crie a sua conta gratuita em segundos para ter acesso a todas as funcionalidades.</p>
                                    </div>
                                    <div className="relative flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-card z-10">
                                            <FileText className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold mt-4">2. Reporte e Consulte</h3>
                                        <p className="text-muted-foreground mt-2">Utilize o mapa interativo para reportar um incidente, mapear um problema ou iniciar um pedido de licença.</p>
                                    </div>
                                    <div className="relative flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-card z-10">
                                            <Building className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold mt-4">3. Acompanhe o Impacto</h3>
                                        <p className="text-muted-foreground mt-2">Receba notificações sobre o andamento dos seus reportes e veja as melhorias a acontecer.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    </section>

                     <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
                        <div className="container px-4 md:px-6 space-y-8">
                            <Card>
                                <CardContent className="p-10">
                                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">FAQ</div>
                                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Perguntas Frequentes</h2>
                                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                            Tem alguma dúvida? Encontre aqui as respostas para as perguntas mais comuns.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-10">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>Quem pode usar a plataforma Cidadão Online?</AccordionTrigger>
                                            <AccordionContent>
                                                A plataforma é para todos! Qualquer cidadão pode registar-se gratuitamente para reportar incidentes, acompanhar o estado da cidade, fiscalizar obras e solicitar licenças. Os funcionários e gestores municipais utilizam a plataforma para gerir todos os processos, responder às solicitações e comunicar com a comunidade.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2">
                                            <AccordionTrigger>Preciso de pagar para usar a plataforma?</AccordionTrigger>
                                            <AccordionContent>
                                                Não. O registo e a utilização da plataforma para participar, reportar incidentes e consultar informação pública são totalmente gratuitos. Taxas específicas, devidamente regulamentadas, podem ser aplicáveis apenas a serviços formais, como a emissão de uma licença de construção.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3">
                                            <AccordionTrigger>Como é que as minhas contribuições ajudam a cidade?</AccordionTrigger>
                                            <AccordionContent>
                                                Cada reporte que faz sobre um buraco na via, uma falha de iluminação ou um contentor cheio é enviado diretamente para a equipa municipal responsável. A sua informação georreferenciada ajuda o município a identificar problemas rapidamente, a priorizar recursos e a resolver as questões de forma mais eficiente. A sua participação ativa é fundamental para uma cidade mais segura e bem cuidada.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-4">
                                            <AccordionTrigger>Os meus dados pessoais estão seguros?</AccordionTrigger>
                                            <AccordionContent>
                                                Sim. A segurança dos seus dados é a nossa prioridade. A plataforma utiliza as melhores práticas de segurança e está em conformidade com as leis de proteção de dados. Pode consultar a <a href="https://apd.ao/fotos/frontend_1/editor2/110617_lei_22-11_de_17_junho-proteccao_dados_pessoais.pdf" target="_blank" rel="noopener noreferrer" className="text-primary underline">Lei da Proteção de Dados Pessoais de Angola</a> para mais detalhes. As suas informações pessoais são usadas exclusivamente para a gestão das suas contribuições e para a comunicação sobre os seus processos.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <Card>
                             <CardContent className="p-10">
                                <div className="grid items-center justify-center gap-4 text-center">
                                    <div className="space-y-3">
                                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                        Pronto para fazer a diferença?
                                    </h2>
                                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Junte-se a milhares de cidadãos que estão a transformar a nossa cidade. O seu registo é o primeiro passo.
                                    </p>
                                    </div>
                                    <div className="mx-auto w-full max-w-sm space-y-2">
                                        <Button asChild size="lg" className="w-full">
                                            <Link href="/register" prefetch={false}>
                                                Criar a minha conta agora
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
                        <p>&copy; 2024 Cidadão Online. Todos os direitos reservados.</p>
                        <Link href="/docs" className="underline hover:text-primary">Documentação Técnica</Link>
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
  )
}
