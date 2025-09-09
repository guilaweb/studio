
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PointOfInterest, propertyTypeLabelMap } from "@/lib/data";
import { VerificationSeal } from "./verification-seal";
import { BedDouble, Bath, Ruler, Leaf } from "lucide-react";


export const PropertyCard = ({ property }: { property: PointOfInterest }) => {
    const mainPhoto = property.files?.find(f => f.url.match(/\.(jpeg|jpg|gif|png|webp)$/i))?.url || property.updates?.find(u => u.photoDataUri)?.photoDataUri;
    const placeholderImage = "https://placehold.co/600x400.png";

    return (
        <Link href={`/marketplace/${property.id}`} className="group">
            <Card className="overflow-hidden flex flex-col h-full group-hover:shadow-lg transition-shadow duration-200">
                <div className="relative h-40 w-full">
                    <Image
                        src={mainPhoto || placeholderImage}
                        alt={`Imagem de ${property.title}`}
                        fill={true}
                        style={{objectFit: 'cover'}}
                        data-ai-hint="house exterior"
                        className="group-hover:scale-105 transition-transform duration-300"
                    />
                     {property.sustainableSeal && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 p-1.5 rounded-full bg-green-100/80 text-green-800 text-xs font-semibold backdrop-blur-sm">
                            <Leaf className="h-3.5 w-3.5" />
                            Sustentável
                        </div>
                    )}
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{property.title}</CardTitle>
                    <CardDescription>
                        {property.propertyType ? propertyTypeLabelMap[property.propertyType] : 'Imóvel'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between pt-2">
                    <div className="text-sm text-muted-foreground space-y-2 mb-4">
                        <div className="flex items-center gap-4">
                            {property.bedrooms && <div className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" /><span>{property.bedrooms}</span></div>}
                            {property.bathrooms && <div className="flex items-center gap-1.5"><Bath className="h-4 w-4" /><span>{property.bathrooms}</span></div>}
                        </div>
                         {property.area && <div className="flex items-center gap-1.5"><Ruler className="h-4 w-4" /><span>{property.area} m²</span></div>}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-lg font-bold text-primary">
                            {property.price ? `AOA ${property.price.toLocaleString()}` : "A Negociar"}
                        </div>
                        <VerificationSeal status={property.status || 'Privado'} />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
