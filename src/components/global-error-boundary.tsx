"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="mt-4">Ocorreu um Erro</CardTitle>
                    <CardDescription>
                        A aplicação encontrou um problema inesperado. Por favor, tente recarregar a página.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <pre className="mt-2 text-left text-xs text-muted-foreground bg-muted p-2 rounded-md overflow-auto max-h-32">
                        <code>
                            {this.state.error?.name}: {this.state.error?.message}
                        </code>
                    </pre>
                    <Button onClick={() => window.location.reload()}>
                        Recarregar Página
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
