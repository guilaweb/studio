
"use client";

import * as React from "react";
import { withAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Building, Car, Phone, Mail, Wrench, CircleDotDashed, Star, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const suppliers = [
  {
    id: "1",
    name: "Oficina Auto Rápido",
    specialties: ["Mecânica Geral", "Diagnóstico Eletrónico"],
    rating: 4.8,
    contact: {
      name: "Sr. Carlos",
      phone: "923000111",
      email: "geral@autorapido.co.ao"
    },
    avatar: "/avatars/01.png"
  },
  {
    id: "2",
    name: "Pneus & Cia",
    specialties: ["Pneus", "Alinhamento de Direção"],
    rating: 4.5,
    contact: {
      name: "Dona Alice",
      phone: "923000222",
      email: "vendas@pneuscia.co.ao"
    },
    avatar: "/avatars/02.png"
  },
  {
    id: "3",
    name: "Eletrocar Serviços",
    specialties: ["Eletricista Auto", "Ar Condicionado"],
    rating: 4.9,
    contact: {
      name: "Sr. João",
      phone: "923000333",
      email: "joao.eletricista@email.com"
    },
     avatar: "/avatars/03.png"
  },
   {
    id: "4",
    name: "Mega Peças Angola",
    specialties: ["Venda de Peças"],
    rating: 4.6,
    contact: {
      name: "Gerente de Vendas",
      phone: "923000444",
      email: "vendas@megapecas.co.ao"
    },
     avatar: "/avatars/04.png"
  }
];

const specialties = ["Mecânica Geral", "Diagnóstico Eletrónico", "Pneus", "Alinhamento de Direção", "Eletricista Auto", "Ar Condicionado", "Venda de Peças"];

function SuppliersPage() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedSpecialty, setSelectedSpecialty] = React.useState("all");

    const filteredSuppliers = React.useMemo(() => {
        return suppliers.filter(s => {
            const nameMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            const specialtyMatch = selectedSpecialty === "all" || s.specialties.includes(selectedSpecialty);
            return nameMatch && specialtyMatch;
        });
    }, [searchTerm, selectedSpecialty]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button size="icon" variant="outline" asChild>
                    <Link href="/admin/equipa">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Portal de Fornecedores
                </h1>
            </header>
            <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Encontre Prestadores de Serviços Verificados</CardTitle>
                        <CardDescription>
                            Pesquise na nossa rede de parceiros para encontrar a solução certa para as necessidades da sua frota.
                        </CardDescription>
                         <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Pesquisar por nome da oficina..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                                <SelectTrigger className="w-full sm:w-[280px]">
                                    <SelectValue placeholder="Filtrar por especialidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Especialidades</SelectItem>
                                    {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredSuppliers.map(supplier => (
                                <Card key={supplier.id}>
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                             <Avatar className="h-12 w-12">
                                                <AvatarImage src={supplier.avatar} alt={supplier.name} />
                                                <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg">{supplier.name}</CardTitle>
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <span className="font-semibold">{supplier.rating}</span>
                                                    <span className="text-xs text-muted-foreground">(Simulado)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm">Especialidades</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {supplier.specialties.map(spec => <Badge key={spec} variant="secondary">{spec}</Badge>)}
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <h4 className="font-semibold text-sm">Contacto</h4>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>{supplier.contact.name}</p>
                                                <p className="flex items-center gap-2"><Phone className="h-3 w-3"/> {supplier.contact.phone}</p>
                                                <p className="flex items-center gap-2"><Mail className="h-3 w-3"/> {supplier.contact.email}</p>
                                            </div>
                                        </div>
                                        <Button className="w-full">Pedir Orçamento (Em Breve)</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                         {filteredSuppliers.length === 0 && (
                            <div className="text-center py-16 text-muted-foreground">
                                <Wrench className="mx-auto h-12 w-12" />
                                <p className="mt-4">Nenhum fornecedor encontrado com os filtros atuais.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default withAuth(SuppliersPage, ['Agente Municipal', 'Administrador']);
