
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Briefcase, Droplets, ShoppingBasket, School, Zap } from "lucide-react";
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

const examples = [
    {
        title: "A Jornada do Utilizador com a MUNITU",
        user: "Sr. Mateus (Cidadão), Chefe de Manutenção, Construtora, Arquiteto",
        icon: Zap,
        challenge: "A rua principal de um bairro está perigosamente escura, mas o processo para resolver o problema e capitalizar na melhoria é fragmentado e lento.",
        solution: [
            {
                step: "O Problema",
                description: "O Sr. Mateus, um cidadão, vê que a rua principal do seu bairro está escura. Ele abre a app MUNITU e, com alguns cliques, reporta os candeeiros avariados no módulo de Iluminação Pública."
            },
            {
                step: "A Ação",
                description: "No Painel Municipal, a chefe do departamento de manutenção vê os novos reportes e atribui uma ordem de serviço à equipa de eletricistas."
            },
            {
                step: "A Resolução",
                description: "A equipa repara os candeeiros e marca a tarefa como 'Resolvida' na sua app de campo. O Sr. Mateus recebe uma notificação: 'MUNITU informa: O problema de iluminação que reportou foi resolvido. Obrigado por fazer a sua parte!'"
            },
            {
                step: "O Investimento",
                description: "Uma construtora, ao analisar os dados da MUNITU, percebe que o bairro está a melhorar e a valorizar. Usam o módulo PGUL para encontrar um lote disponível para um novo edifício."
            },
            {
                step: "O Licenciamento",
                description: "O arquiteto submete todo o projeto através da MUNITU. Ele acompanha cada passo do processo, comunica com os técnicos e paga as taxas diretamente na plataforma."
            }
        ],
        result: "A licença é emitida digitalmente. A nova obra aparece no mapa público, e os vizinhos podem verificar a sua legalidade e acompanhar o seu progresso, tudo dentro do ecossistema MUNITU, completando o ciclo de melhoria e desenvolvimento urbano."
    },
    {
        title: "Exemplo de Uso 1: A Empreendedora e a Burocracia Zero",
        user: "Sofia, uma jovem empreendedora que quer abrir o seu primeiro café no bairro Maculusso.",
        icon: Briefcase,
        challenge: "Sofia teria de passar semanas ou meses a visitar diferentes repartições (Administração Municipal, Bombeiros, Comércio) para perceber quais os documentos necessários, submeter papéis que se poderiam perder e esperar indefinidamente por aprovações.",
        solution: [
            {
                step: "Consulta (Módulo PGUL)",
                description: "Sofia usa a MUNITU para procurar um espaço comercial disponível. Ela encontra uma loja e clica nela no mapa, vendo imediatamente as regras: 'Uso comercial permitido. Requer licença de restauração e parecer dos bombeiros.'"
            },
            {
                step: "Licenciamento (Serviços ao Cidadão)",
                description: "Através do Módulo de Licenciamento Digital, ela inicia o processo 'Abrir um Café'. A MUNITU apresenta um checklist dinâmico de todos os documentos que precisa de submeter."
            },
            {
                step: "Submissão Única",
                description: "Ela faz o upload da planta do café (desenhada pelo seu arquiteto), do seu alvará comercial e dos outros documentos. Ela paga as taxas iniciais através do Módulo de Pagamentos."
            },
            {
                step: "Acompanhamento Transparente",
                description: "No seu painel da MUNITU, Sofia vê o estado do seu processo em tempo real. Ela recebe uma notificação: 'O seu plano de segurança contra incêndios foi aprovado pelos Bombeiros.'"
            },
        ],
        result: "Em vez de meses de incerteza, Sofia obtém a sua licença de funcionamento em poucas semanas, emitida digitalmente pela MUNITU. Ela pode focar-se no que realmente importa: preparar o melhor café da cidade."
    },
    {
        title: "Exemplo de Uso 2: A Crise da Fuga de Água e a Resposta Rápida",
        user: "Moradores do bairro Prenda e a equipa da EPAL.",
        icon: Droplets,
        challenge: "Uma grande conduta de água rebenta durante a noite, inundando uma rua. Os moradores não sabem a quem ligar. A EPAL só fica a saber horas depois, quando dezenas de chamadas sobrecarregam a sua linha telefónica, e não sabem a localização exata do problema.",
        solution: [
            {
                step: "Alerta Cidadão (Módulo de Água)",
                description: "Às 2 da manhã, o Sr. Paulo acorda com o barulho da água. Ele abre a MUNITU, vai ao Módulo de Água e reporta uma 'Fuga Grave', tirando uma foto da rua inundada. A app regista a localização exata."
            },
            {
                step: "Confirmação em Massa",
                description: "Nos 10 minutos seguintes, mais 15 vizinhos fazem o mesmo."
            },
            {
                step: "Alerta Automático (Painel Municipal)",
                description: "O sistema da MUNITU deteta múltiplos reportes na mesma localização e eleva o incidente para o nível 'Crítico'. Um alerta automático é enviado para o telemóvel do supervisor de piquete da EPAL."
            },
            {
                step: "Ação Imediata",
                description: "O supervisor, a partir do seu tablet, vê a localização exata no mapa e as fotos. Ele identifica a conduta afetada no Mapa de Infraestruturas da MUNITU e envia a equipa de reparação mais próxima diretamente para o local correto."
            },
            {
                step: "Comunicação Proativa",
                description: "Ao mesmo tempo, ele usa o Módulo de Comunicação para enviar uma notificação a todos os utilizadores da MUNITU no bairro: 'Detetámos uma fuga grave na Rua X. O abastecimento será interrompido temporariamente para reparação. Previsão de restabelecimento: 7h. Pedimos desculpa pelo incómodo.'"
            }
        ],
        result: "A resposta é imediata, o desperdício de água é minimizado e os cidadãos são informados em vez de ficarem frustrados e sem saber o que se passa."
    },
    {
        title: "Exemplo de Uso 3: A Feira Semanal e a Formalização",
        user: "Dona Kial, vendedora de frutas e vegetais (zungueira) numa feira em Viana.",
        icon: ShoppingBasket,
        challenge: "Dona Kial vende numa zona 'cinzenta'. Às vezes, os fiscais aparecem e criam problemas por falta de uma licença clara, gerando instabilidade no seu negócio.",
        solution: [
            {
                step: "Organização (Serviços ao Cidadão)",
                description: "A Administração Municipal usa a MUNITU para anunciar um 'Programa de Cadastro de Feirantes'."
            },
            {
                step: "Registo Simplificado",
                description: "Com a ajuda de um agente comunitário ou de um familiar mais novo, Dona Kial usa a app MUNITU para se registar. Ela tira uma foto do seu Bilhete de Identidade e indica o tipo de produtos que vende."
            },
            {
                step: "Licença Digital",
                description: "Após o registo, ela recebe uma licença de feirante digital na sua conta MUNITU, com um código QR pessoal. Ela paga uma pequena taxa mensal diretamente através da app."
            },
            {
                step: "Fiscalização Justa",
                description: "Quando um fiscal municipal se aproxima, ele não precisa de criar conflito. Ele simplesmente pede para ver o código QR no telemóvel de Dona Kial. Ele escaneia o código com a sua app de fiscalização da MUNITU e vê instantaneamente: 'Kial Domingos. Licença: Venda de Hortícolas. Taxas: Em dia. Válida.'"
            }
        ],
        result: "Dona Kial ganha segurança e dignidade no seu trabalho. A Administração Municipal organiza o comércio, reduz a corrupção na fiscalização e aumenta a sua base de receita de forma transparente."
    },
    {
        title: "Exemplo de Uso 4: O Acidente e o Planeamento Urbano",
        user: "Estudantes de uma escola e um urbanista da Administração Municipal.",
        icon: School,
        challenge: "Os pais estão preocupados com a velocidade dos carros perto da escola dos seus filhos, mas as suas queixas individuais não têm força para gerar uma ação.",
        solution: [
            {
                step: "Recolha de Dados (Mapa de Risco Rodoviário)",
                description: "A associação de pais e professores organiza uma campanha. Durante um mês, sempre que testemunham uma quase-colisão ou um carro em excesso de velocidade, eles fazem um reporte anónimo na MUNITU."
            },
            {
                step: "A Evidência",
                description: "Ao fim de um mês, o Mapa de Calor no painel público da MUNITU mostra uma mancha vermelha intensa exatamente em frente à escola."
            },
            {
                step: "Análise (Painel Municipal)",
                description: "Um urbanista, ao analisar os dados, vê o 'cluster' de incidentes. Ele cruza essa informação com outras camadas do mapa e percebe que não há passadeiras nem sinalização de 'zona escolar' naquele troço."
            },
            {
                step: "Proposta e Ação",
                description: "O urbanista usa estes dados para justificar a necessidade urgente de instalar lombas e sinalização. A proposta é aprovada rapidamente porque não se baseia em 'achismos', mas em dados concretos fornecidos pela comunidade."
            },
            {
                step: "Feedback",
                description: "A obra de instalação das lombas é registada no Observatório de Obras da MUNITU, e a comunidade pode acompanhar a sua execução, fechando o ciclo."
            }
        ],
        result: "A segurança das crianças aumenta drasticamente, e a comunidade sente que a sua participação ativa teve um impacto real e visível."
    }
];

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

export default function UseCasesPage() {
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
                        mapId={'use-cases-map'}
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
                            Exemplos de Uso
                        </h1>
                    </header>
                    <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                        {examples.map((example, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                                            <example.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>{example.title}</CardTitle>
                                            <CardDescription>
                                                <strong>Utilizador(es):</strong> {example.user}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">O Desafio Antigo</h3>
                                        <p className="text-muted-foreground">{example.challenge}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">A Solução com a MUNITU</h3>
                                        <div className="space-y-4">
                                            {example.solution.map((item, idx) => (
                                                <div key={idx} className="pl-4 border-l-2 border-primary">
                                                    <h4 className="font-semibold">{item.step}</h4>
                                                    <p className="text-muted-foreground">{item.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <h3 className="font-semibold text-lg text-green-800 dark:text-green-300 mb-2">Resultado</h3>
                                        <p className="text-green-700 dark:text-green-400">{example.result}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </main>
                </div>
            </div>
        </APIProvider>
    );
}
