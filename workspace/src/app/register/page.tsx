
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { APIProvider, Map as GoogleMap } from "@vis.gl/react-google-maps";
import { useSubscriptionPlans } from "@/services/plans-service";
import { createDefaultSubscription } from "@/services/subscription-service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  displayName: z.string().min(1, "O nome é obrigatório."),
  organizationName: z.string().min(3, "O nome da entidade é obrigatório."),
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

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

function RegisterPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'free'; 
  const billingCycle = searchParams.get('cycle') || 'monthly';
  const { subscriptionPlans, loading: loadingPlans } = useSubscriptionPlans();
  const selectedPlan = React.useMemo(() => subscriptionPlans.find(p => p.id === planId), [subscriptionPlans, planId]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      organizationName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedPlan) {
        toast({ variant: "destructive", title: "Erro", description: "Plano de subscrição inválido. Por favor, volte e selecione um plano."});
        router.push('/planos');
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: values.displayName });
      
      const userDocRef = doc(db, "users", user.uid);
      
      const organizationId = `org_${user.uid.substring(0, 10)}_${Date.now()}`;
      const orgDocRef = doc(db, 'organizations', organizationId);
      await setDoc(orgDocRef, {
        name: values.organizationName,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });
      
      await createDefaultSubscription(organizationId, selectedPlan, billingCycle as 'monthly' | 'annual');

      await setDoc(userDocRef, {
            uid: user.uid,
            displayName: values.displayName,
            email: user.email,
            photoURL: user.photoURL || null,
            role: "Administrador",
            organizationId: organizationId,
            createdAt: new Date().toISOString(),
            onboardingCompleted: false,
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "A sua conta foi criada. Será agora redirecionado.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no registo",
        description: "Não foi possível criar a conta. O e-mail pode já estar em uso.",
      });
      console.error("Registration error:", error);
    }
  };
  
  if (loadingPlans) {
      return (
          <div className="flex h-screen items-center justify-center">
               <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <Skeleton className="h-10 w-10 mx-auto rounded-full"/>
                        <Skeleton className="h-6 w-32 mx-auto mt-2"/>
                        <Skeleton className="h-4 w-48 mx-auto mt-1"/>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full mt-2" />
                    </CardContent>
                </Card>
          </div>
      );
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="fixed inset-0 z-0 opacity-20">
                <GoogleMap
                    defaultCenter={{ lat: -8.8368, lng: 13.2343 }}
                    defaultZoom={13}
                    gestureHandling={'none'}
                    disableDefaultUI={true}
                    mapId={'auth-map'}
                />
            </div>
            <div className="relative z-10">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                    <Link href="/" className="inline-block mx-auto">
                        <Logo className="h-10 w-10 mx-auto text-primary" />
                    </Link>
                    <CardTitle className="text-2xl">Criar Conta</CardTitle>
                    <CardDescription>
                        A registar para o plano <span className="font-bold text-primary">{selectedPlan?.name || 'Padrão'}</span>.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Seu Nome Completo</FormLabel>
                                <FormControl>
                                <Input placeholder="O seu nome" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="organizationName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome da Entidade/Município</FormLabel>
                                <FormControl>
                                <Input placeholder="Ex: Município de Luanda" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Institucional</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder="seu@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="Crie uma senha" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Criar Conta
                        </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="underline">
                        Entrar
                        </Link>
                    </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </APIProvider>
  );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <RegisterPageContent />
        </Suspense>
    )
}
