
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APIProvider } from "@vis.gl/react-google-maps";
import PropertyRegistrationWizard from "@/components/meus-imoveis/property-registration-wizard";

function RegisterPropertyPage() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Button size="icon" variant="outline" asChild>
            <Link href="/meus-imoveis">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar para Meus Imóveis</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Registar Novo Imóvel
          </h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-6">
          <PropertyRegistrationWizard />
        </main>
      </div>
    </APIProvider>
  );
}

export default withAuth(RegisterPropertyPage);
