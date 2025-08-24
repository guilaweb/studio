
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BulkImport from "@/components/meus-croquis/bulk-import";

function ImportCroquisPage() {

  return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Button size="icon" variant="outline" asChild>
            <Link href="/meus-croquis">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar para Meus Croquis</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Importar Croquis em Massa
          </h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-6">
          <BulkImport />
        </main>
      </div>
  );
}

export default withAuth(ImportCroquisPage);
