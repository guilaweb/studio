
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Building, FileText, Siren } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="sr-only">Cidadão Online</span>
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
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Cidadão Online: A sua voz na gestão da cidade
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Participe ativamente na melhoria do seu bairro. Reporte incidentes, consulte o andamento de obras públicas e solicite licenças de construção de forma simples e transparente.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register" prefetch={false}>
                      Começar Agora
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="#features" prefetch={false}>
                        Saber Mais
                    </Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://placehold.co/600x600.png"
                width="600"
                height="600"
                alt="Hero"
                data-ai-hint="map city participation"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Funcionalidades Principais</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Uma Plataforma Completa para o Cidadão</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ferramentas poderosas para si e para a administração municipal, promovendo uma cidade mais conectada, eficiente e transparente.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="bg-primary/10 p-4 rounded-full">
                    <Siren className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Reporte de Incidentes</h3>
                <p className="text-muted-foreground">
                  Viu um acidente, um buraco na via ou uma falha na iluminação? Reporte diretamente pelo mapa e ajude as equipas municipais a agir rapidamente.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                 <div className="bg-primary/10 p-4 rounded-full">
                    <Building className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Acompanhamento de Obras</h3>
                <p className="text-muted-foreground">
                  Consulte o estado e o cronograma de obras públicas e privadas na sua área. Deixe o seu feedback e contribua para a fiscalização.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                 <div className="bg-primary/10 p-4 rounded-full">
                    <FileText className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Licenciamento Simplificado</h3>
                <p className="text-muted-foreground">
                  Inicie e acompanhe o seu pedido de licença de construção online, com menos burocracia e mais transparência em todo o processo.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
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
                        Criar a minha conta
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Cidadão Online. Todos os direitos reservados.</p>
        <div className="sm:ml-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground text-center sm:text-right">
            <div>
                <p className="font-semibold">Dianguila Empreendimentos, (SU), Lda.</p>
                <p>NIF: 5001706802 | Matrícula: 39110-23/231102</p>
            </div>
        </div>
      </footer>
    </div>
  )
}
