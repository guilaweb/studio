

"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


function ComunicacoesRedirectPage() {
    const router = useRouter();

    React.useEffect(() => {
        router.replace('/?poi=announcement-1755434075725#report-announcement');
    }, [router]);
    
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
                    Comunicações Georreferenciadas
                </h1>
            </header>
            <main className="flex flex-1 items-center justify-center">
                <p>A redirecionar para a página principal para criar um anúncio...</p>
            </main>
        </div>
    );
}

export default withAuth(ComunicacoesRedirectPage, ['Agente Municipal', 'Administrador']);
