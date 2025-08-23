import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { PointsProvider } from '@/hooks/use-points';
import { ThemeProvider } from '@/components/theme-provider';
import GlobalErrorBoundary from '@/components/global-error-boundary';

export const metadata: Metadata = {
  title: 'MUNITU',
  description: 'MUNITU: Você faz a cidade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8354217353620660"
     crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        <GlobalErrorBoundary>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
            <AuthProvider>
                <PointsProvider>
                {children}
                <Toaster />
                </PointsProvider>
            </AuthProvider>
            </ThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
