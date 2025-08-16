
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

const pointOfInterestExample = `
{
  "id": "incident-1754013627883",
  "type": "incident",
  "position": { "lat": -8.8368, "lng": 13.2343 },
  "title": "Colisão Grave",
  "description": "Acidente entre dois veículos no cruzamento principal.",
  "status": "unknown",
  "priority": "high",
  "lastReported": "2024-05-26T12:40:27.883Z",
  "authorId": "user123",
  "updates": [
    {
      "id": "update-01",
      "text": "Acidente entre dois veículos no cruzamento principal.",
      "authorId": "user123",
      "authorDisplayName": "Nome do Cidadão",
      "timestamp": "2024-05-26T12:40:27.883Z"
    }
  ]
}
`;

export default function DocsPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar ao Mapa</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Documentação Técnica
                </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Formatos de Dados</CardTitle>
                        <CardDescription>
                            Entenda a estrutura dos principais objetos de dados utilizados na plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Objeto: PointOfInterest</h3>
                            <p className="text-muted-foreground text-sm mb-2">
                                A estrutura base para todos os pontos reportados no mapa.
                            </p>
                            <CodeBlock code={pointOfInterestExample} />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Sistema Geodésico Nacional</CardTitle>
                        <CardDescription>
                            Informações sobre o sistema de referência e projeção a ser utilizado em projetos de engenharia e arquitetura.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Datum de Referência</h3>
                            <p className="text-muted-foreground">
                                O datum geodésico de referência para Angola é o **WGS 84 (World Geodetic System 1984)**. Todos os levantamentos e projetos devem utilizar este sistema para garantir a compatibilidade e precisão dos dados geográficos a nível nacional e internacional.
                            </p>
                        </div>
                         <div className="space-y-2">
                            <h3 className="font-semibold">Sistema de Projeção</h3>
                            <p className="text-muted-foreground">
                                O sistema de projeção cartográfica adotado é a **Projeção Universal Transversa de Mercator (UTM)**. O território de Angola abrange as seguintes zonas UTM:
                            </p>
                             <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li><strong>Zona 32 Sul:</strong> Para a província de Cabinda.</li>
                                <li><strong>Zona 33 Sul:</strong> Para a maior parte do território continental, a oeste do meridiano 18°E.</li>
                                <li><strong>Zona 34 Sul:</strong> Para a faixa oriental do país, a leste do meridiano 18°E.</li>
                            </ul>
                            <p className="text-sm text-muted-foreground pt-2">
                                É da responsabilidade do técnico responsável pelo projeto selecionar a zona UTM correta com base na localização geográfica da obra para garantir a máxima precisão cartográfica.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Notas Adicionais</h3>
                            <p className="text-muted-foreground">
                                A precisão na georreferenciação de projetos é fundamental para o planeamento urbano, gestão de infraestruturas e segurança jurídica. A conformidade com estas normas é obrigatória para a aprovação de processos de licenciamento. Para mais detalhes técnicos, consulte a documentação oficial do Instituto Geográfico e Cadastral de Angola (IGCA).
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
