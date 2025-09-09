
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { Logo } from "@/components/icons";

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

export default function PrivacyPolicyPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="relative flex flex-col min-h-screen bg-background text-foreground">
                <div className="fixed inset-0 z-0 opacity-20">
                    <GoogleMap
                        defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                        defaultZoom={13}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        mapId={'privacy-map'}
                    />
                </div>
                <div className="relative z-10 flex flex-1 flex-col bg-transparent">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                        <Button size="icon" variant="outline" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Voltar</span>
                            </Link>
                        </Button>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            Política de Privacidade
                        </h1>
                    </header>
                    <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                        <Card className="prose prose-sm md:prose-base dark:prose-invert max-w-full">
                            <CardHeader>
                                <CardTitle>Política de Privacidade da Plataforma MUNITU</CardTitle>
                                <CardDescription>Última atualização: 30 de Julho de 2024</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <section>
                                    <h2 className="font-semibold text-lg">1. Introdução</h2>
                                    <p>A sua privacidade é de extrema importância para a MUNITU. Esta Política de Privacidade descreve como a Dianguila Empreendimentos, (SU), Lda. ("nós", "nosso") recolhe, utiliza, partilha e protege as informações pessoais dos utilizadores ("Utilizador", "seu") da nossa plataforma. Este documento foi elaborado em conformidade com as melhores práticas internacionais de proteção de dados.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">2. Informação que Recolhemos</h2>
                                    <p>Recolhemos diferentes tipos de informação para fornecer e melhorar os nossos serviços:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li><strong>Informação Fornecida pelo Utilizador:</strong> Inclui dados de registo como nome, endereço de e-mail e senha. Também inclui informações fornecidas ao preencher perfis, submeter pedidos de licença ou ao comunicar connosco.</li>
                                        <li><strong>Conteúdo Gerado pelo Utilizador:</strong> Todas as informações que submete ativamente na plataforma, como reportes de incidentes, comentários em obras, fotos, documentos de prova e desenhos de polígonos de terrenos.</li>
                                        <li><strong>Dados de Localização:</strong> Quando reporta um incidente ou utiliza funcionalidades baseadas em mapa, recolhemos dados de geolocalização precisos para contextualizar a sua contribuição.</li>
                                        <li><strong>Dados de Utilização:</strong> Recolhemos informações sobre como interage com a plataforma, como as funcionalidades que utiliza e a frequência de acesso, para nos ajudar a melhorar a experiência do utilizador.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">3. Como Utilizamos a Sua Informação</h2>
                                    <p>Utilizamos a sua informação para os seguintes fins:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Para operar e manter a Plataforma, incluindo a gestão da sua conta.</li>
                                        <li>Para processar as suas contribuições e encaminhá-las para as entidades municipais competentes para análise e resolução.</li>
                                        <li>Para comunicar consigo sobre o estado dos seus reportes, licenças ou outras interações.</li>
                                        <li>Para personalizar a sua experiência e, no futuro, fornecer notificações contextuais relevantes.</li>
                                        <li>Para fins de análise interna, visando melhorar a segurança, a funcionalidade e a eficácia da plataforma.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">4. Partilha e Divulgação de Informação</h2>
                                    <p>A sua informação é partilhada de forma limitada e com propósitos específicos:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li><strong>Com Entidades Governamentais:</strong> O conteúdo das suas contribuições (ex: a descrição de um buraco na via e a sua localização) é partilhado com as administrações municipais e outros órgãos competentes para que possam atuar.</li>
                                        <li><strong>Informação Pública:</strong> Certas informações, como a localização de um incidente reportado ou os dados de uma obra licenciada, são tornadas públicas no mapa para garantir a transparência do processo. O seu nome de utilizador pode ser associado a estas contribuições públicas.</li>
                                        <li><strong>Prestadores de Serviços:</strong> Podemos utilizar serviços de terceiros (ex: serviços de alojamento em nuvem) que processam dados em nosso nome. Estes prestadores estão contratualmente obrigados a proteger a sua informação.</li>
                                        <li><strong>Obrigações Legais:</strong> Podemos divulgar a sua informação se formos obrigados por lei ou se acreditarmos de boa-fé que tal é necessário para proteger os nossos direitos, a sua segurança ou a segurança de outros.</li>
                                    </ul>
                                    <p>Nunca venderemos as suas informações pessoais a terceiros para fins de marketing.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">5. Segurança dos Dados</h2>
                                    <p>Implementamos medidas de segurança técnicas e organizacionais para proteger as suas informações contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum sistema é 100% seguro, e não podemos garantir a segurança absoluta da sua informação.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">6. Os Seus Direitos</h2>
                                    <p>De acordo com a legislação de proteção de dados aplicável na sua jurisdição, o Utilizador tem o direito de aceder, retificar ou apagar as suas informações pessoais. Pode exercer estes direitos através das configurações do seu perfil na plataforma ou contactando-nos diretamente. Note que a eliminação de certas informações pode impedir a prestação de alguns serviços.</p>
                                </section>
                                
                                <section>
                                    <h2 className="font-semibold text-lg">7. Contacto</h2>
                                    <p>Se tiver alguma questão sobre esta Política de Privacidade, por favor contacte-nos através dos canais disponibilizados na plataforma.</p>
                                </section>
                            </CardContent>
                        </Card>
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
                                <Link href="/monetizacao" className="text-muted-foreground hover:text-primary" prefetch={false}>Monetização</Link>
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
