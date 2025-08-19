
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

export default function TermsAndConditionsPage() {
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
                        mapId={'terms-map'}
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
                            Termos e Condições de Uso
                        </h1>
                    </header>
                    <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                        <Card className="prose prose-sm md:prose-base dark:prose-invert max-w-full">
                            <CardHeader>
                                <CardTitle>Termos e Condições de Utilização da Plataforma MUNITU</CardTitle>
                                <CardDescription>Última atualização: 29 de Julho de 2024</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <section>
                                    <h2 className="font-semibold text-lg">1. Aceitação dos Termos</h2>
                                    <p>Ao aceder e utilizar a plataforma MUNITU ("Plataforma"), propriedade da Dianguila Empreendimentos, (SU), Lda., o utilizador ("Utilizador") concorda em cumprir e ficar vinculado aos presentes Termos e Condições de Utilização ("Termos"). Se não concordar com estes Termos, não deverá aceder ou utilizar a Plataforma.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">2. Descrição dos Serviços</h2>
                                    <p>A MUNITU é uma plataforma de governação digital que visa conectar cidadãos, empresas e entidades governamentais para melhorar a gestão urbana. Os serviços incluem, mas não se limitam a, reporte de incidentes, mapeamento de infraestruturas, processos de licenciamento digital e um marketplace imobiliário.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">3. Contas de Utilizador</h2>
                                    <p>Para aceder a certas funcionalidades, o Utilizador deve criar uma conta, fornecendo informações verdadeiras, precisas e completas. O Utilizador é responsável por manter a confidencialidade da sua senha e por todas as atividades que ocorram na sua conta. A MUNITU não se responsabiliza por qualquer perda ou dano resultante do incumprimento desta obrigação de segurança.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">4. Conteúdo Gerado pelo Utilizador</h2>
                                    <p>O Utilizador é o único responsável por todo o conteúdo que submete, publica ou exibe na Plataforma, incluindo textos, imagens, ficheiros e dados de localização ("Conteúdo do Utilizador"). Ao submeter Conteúdo do Utilizador, concede à MUNITU uma licença mundial, não exclusiva, isenta de royalties, para usar, reproduzir, modificar e distribuir esse conteúdo no âmbito da prestação dos serviços da Plataforma.</p>
                                    <p>O Utilizador garante que detém todos os direitos necessários para conceder esta licença e que o seu Conteúdo do Utilizador não viola os direitos de terceiros nem qualquer lei aplicável.</p>
                                </section>
                                
                                <section>
                                    <h2 className="font-semibold text-lg">5. Uso Aceitável da Plataforma</h2>
                                    <p>O Utilizador concorda em não utilizar a Plataforma para:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Publicar conteúdo falso, enganador, difamatório ou ilegal.</li>
                                        <li>Violar os direitos de propriedade intelectual de terceiros.</li>
                                        <li>Tentar obter acesso não autorizado aos sistemas ou redes da Plataforma.</li>
                                        <li>Interferir com a utilização e fruição da Plataforma por parte de outros utilizadores.</li>
                                    </ul>
                                    <p>A MUNITU reserva-se o direito de remover qualquer conteúdo e suspender ou cancelar contas que violem estes Termos.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">6. Privacidade e Proteção de Dados</h2>
                                    <p>A nossa Política de Privacidade, que está em conformidade com a Lei n.º 22/11, de 17 de Junho (Lei da Proteção de Dados Pessoais de Angola), descreve como recolhemos, usamos e protegemos os seus dados pessoais. Ao utilizar a Plataforma, o Utilizador concorda com as práticas descritas na nossa Política de Privacidade.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">7. Limitação de Responsabilidade</h2>
                                    <p>A Plataforma é fornecida "como está" e "conforme disponível". A MUNITU não garante que a Plataforma seja isenta de erros ou interrupções. A informação disponibilizada na Plataforma, incluindo a gerada por inteligência artificial ou por outros utilizadores, tem um caráter informativo e não substitui a análise técnica qualificada ou a verificação oficial por parte das entidades competentes.</p>
                                    <p>Em nenhuma circunstância a MUNITU será responsável por quaisquer danos diretos, indiretos, incidentais ou consequenciais resultantes da utilização ou incapacidade de utilização da Plataforma.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">8. Propriedade Intelectual</h2>
                                    <p>Todos os conteúdos da Plataforma, incluindo o software, design, texto, gráficos e logótipos, são propriedade exclusiva da Dianguila Empreendimentos, (SU), Lda. ou dos seus licenciadores e estão protegidos por leis de propriedade intelectual.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">9. Alterações aos Termos</h2>
                                    <p>A MUNITU reserva-se o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor após a sua publicação na Plataforma. O uso continuado da Plataforma após a publicação das alterações constitui a aceitação dos novos Termos.</p>
                                </section>

                                <section>
                                    <h2 className="font-semibold text-lg">10. Legislação Aplicável e Foro</h2>
                                    <p>Estes Termos serão regidos e interpretados de acordo com as leis da República de Angola. Para a resolução de qualquer litígio emergente da interpretação ou execução dos presentes Termos, as partes elegem o foro da Comarca de Luanda, com expressa renúncia a qualquer outro.</p>
                                </section>
                            </CardContent>
                        </Card>
                    </main>
                    <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background/80 backdrop-blur-sm">
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
