
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PointOfInterest, propertyTypeLabelMap } from "@/lib/data";
import { VerificationSeal } from "./verification-seal";


export const PropertyCard = ({ property }: { property: PointOfInterest }) => {
    const mainPhoto = property.updates?.find(u => u.photoDataUri)?.photoDataUri;
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
                </div>
                <CardHeader>
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <CardDescription>
                        {property.propertyType ? propertyTypeLabelMap[property.propertyType] : 'Imóvel'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="flex justify-between items-center">
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
