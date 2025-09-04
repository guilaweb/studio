
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
                    <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background/80 backdrop-blur-sm">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                            <p>&copy; 2024 MUNITU. Todos os direitos reservados.</p>
                            <Link href="/docs" className="underline hover:text-primary">Documentação Técnica</Link>
                            <Link href="/artigo-cientifico" className="underline hover:text-primary">Artigo Científico</Link>
                            <Link href="/funcionalidades" className="underline hover:text-primary">Funcionalidades</Link>
                            <Link href="/exemplos-de-uso" className="underline hover:text-primary">Exemplos de Uso</Link>
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
