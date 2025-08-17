

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PointOfInterestStatus, PointOfInterestUsageType } from '@/lib/data';
import { Search, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '../ui/separator';

export interface SearchFilters {
    location: string;
    area: number | null;
    usageType: PointOfInterestUsageType | null;
    minPrice: number | null;
    maxPrice: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    verification: PointOfInterestStatus[];
    taxStatus: boolean;
}

interface PropertySearchProps {
    onSearch: (filters: SearchFilters) => void;
    initialFilters: SearchFilters;
}

const PropertySearch: React.FC<PropertySearchProps> = ({ onSearch, initialFilters }) => {
    const [filters, setFilters] = React.useState<SearchFilters>(initialFilters);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value === '' ? null : value }));
    };

    const handleSelectChange = (name: keyof SearchFilters) => (value: string) => {
        setFilters(prev => ({ ...prev, [name]: value === 'all' ? null : value }));
    };
    
    const handleVerificationChange = (status: PointOfInterestStatus) => (checked: boolean) => {
        setFilters(prev => {
            const currentVerification = prev.verification || [];
            const newVerification = checked 
                ? [...currentVerification, status]
                : currentVerification.filter(s => s !== status);
            return { ...prev, verification: newVerification };
        });
    }
    
    const handleTaxStatusChange = (checked: boolean) => {
        setFilters(prev => ({ ...prev, taxStatus: checked }));
    }

    const handleSearch = () => {
        onSearch({
            ...filters,
            area: filters.area ? Number(filters.area) : null,
            minPrice: filters.minPrice ? Number(filters.minPrice) : null,
            maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
            bedrooms: filters.bedrooms ? Number(filters.bedrooms) : null,
            bathrooms: filters.bathrooms ? Number(filters.bathrooms) : null,
        });
    };
    
    const handleClear = () => {
        const clearedFilters = {
            ...initialFilters,
            verification: [],
            taxStatus: false
        };
        setFilters(clearedFilters);
        onSearch(clearedFilters);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pesquisa de Imóveis</CardTitle>
                <CardDescription>
                    Use os filtros avançados para encontrar o imóvel ideal.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="location">Localização (Bairro, Município)</Label>
                    <Input id="location" name="location" placeholder="Ex: Viana" value={filters.location} onChange={handleInputChange} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="minPrice">Preço Mínimo (AOA)</Label>
                        <Input id="minPrice" name="minPrice" type="number" placeholder="Ex: 5000000" value={filters.minPrice || ''} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="maxPrice">Preço Máximo (AOA)</Label>
                        <Input id="maxPrice" name="maxPrice" type="number" placeholder="Ex: 20000000" value={filters.maxPrice || ''} onChange={handleInputChange} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="bedrooms">Quartos (mín)</Label>
                        <Input id="bedrooms" name="bedrooms" type="number" placeholder="Ex: 3" value={filters.bedrooms || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bathrooms">Casas de Banho (mín)</Label>
                        <Input id="bathrooms" name="bathrooms" type="number" placeholder="Ex: 2" value={filters.bathrooms || ''} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="area">Área Mínima (m²)</Label>
                        <Input id="area" name="area" type="number" placeholder="Ex: 1000" value={filters.area || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="usageType">Uso Permitido</Label>
                        <Select name="usageType" onValueChange={handleSelectChange('usageType')} value={filters.usageType || 'all'}>
                            <SelectTrigger id="usageType"><SelectValue placeholder="Todos" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tipos</SelectItem>
                                <SelectItem value="residential">Residencial</SelectItem>
                                <SelectItem value="commercial">Comercial</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                                <SelectItem value="mixed">Misto</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-3">
                    <Label className="font-semibold">Filtros de Confiança MUNITU</Label>
                    <div className="space-y-2">
                         <Label className="text-xs">Nível de Verificação</Label>
                         <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="verificado_ouro" onCheckedChange={(checked) => handleVerificationChange('verificado_ouro')(checked as boolean)} checked={filters.verification.includes('verificado_ouro')} />
                                <Label htmlFor="verificado_ouro" className="text-sm font-normal">Ouro</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="verificado_prata" onCheckedChange={(checked) => handleVerificationChange('verificado_prata')(checked as boolean)} checked={filters.verification.includes('verificado_prata')}/>
                                <Label htmlFor="verificado_prata" className="text-sm font-normal">Prata</Label>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Imposto Predial (CPU)</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="taxStatus" onCheckedChange={handleTaxStatusChange} checked={filters.taxStatus} />
                            <Label htmlFor="taxStatus" className="text-sm font-normal">CPU em dia</Label>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="flex gap-2 pt-2">
                    <Button onClick={handleSearch} className="flex-1">
                        <Search className="mr-2 h-4 w-4" />
                        Aplicar Filtros
                    </Button>
                     <Button onClick={handleClear} variant="outline" size="icon">
                        <X className="h-4 w-4" />
                         <span className="sr-only">Limpar Filtros</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PropertySearch;

    