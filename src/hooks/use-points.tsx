
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, DocumentData, query, orderBy, writeBatch, getDocs, where, deleteDoc, Query } from 'firebase/firestore';
import { PointOfInterest, PointOfInterestUpdate, QueueTime, statusLabelMap } from '@/lib/data';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

interface PointsContextType {
  allData: PointOfInterest[];
  addPoint: (point: Omit<PointOfInterest, 'updates' | 'organizationId'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] }, propertyIdToLink?: string) => Promise<void>;
  updatePointStatus: (pointId: string, status: PointOfInterest['status'], updateText?: string, availableNotes?: number[], queueTime?: QueueTime, availableFuels?: string[], partsCost?: number, laborCost?: number) => Promise<void>;
  addUpdateToPoint: (pointId: string, update: Omit<PointOfInterestUpdate, 'id'>) => Promise<void>;
  updatePointDetails: (pointId: string, updates: Partial<Omit<PointOfInterest, 'id' | 'type' | 'authorId' | 'updates'>>) => Promise<void>;
  deletePoint: (pointId: string) => Promise<void>;
  loading: boolean;
}

const PointsContext = createContext<PointsContextType>({
  allData: [],
  addPoint: async () => {},
  updatePointStatus: async () => {},
  addUpdateToPoint: async () => {},
  updatePointDetails: async () => {},
  deletePoint: async () => {},
  loading: true,
});

const convertDocToPointOfInterest = (doc: DocumentData): PointOfInterest => {
    const data = doc.data();
    // Sort updates newest first before returning
    const sortedUpdates = (data.updates || []).sort((a: PointOfInterestUpdate, b: PointOfInterestUpdate) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
        id: doc.id,
        organizationId: data.organizationId,
        isPublic: data.isPublic,
        type: data.type,
        position: data.position,
        polygon: data.polygon,
        polyline: data.polyline,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        price: data.price,
        propertyTaxStatus: data.propertyTaxStatus,
        lastReported: data.lastReported,
        incidentDate: data.incidentDate,
        startDate: data.startDate,
        endDate: data.endDate,
        authorId: data.authorId,
        authorDisplayName: data.authorDisplayName,
        updates: sortedUpdates,
        files: data.files,
        // Land Plot & Property Specific
        propertyType: data.propertyType,
        area: data.area, // in square meters
        builtArea: data.builtArea, // in square meters
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        plotNumber: data.plotNumber,
        registrationCode: data.registrationCode,
        zoningInfo: data.zoningInfo, // General notes
        usageType: data.usageType,
        maxHeight: data.maxHeight, // in floors
        buildingRatio: data.buildingRatio, // percentage
        minLotArea: data.minLotArea, // Loteamento
        roadCession: data.roadCession, // Loteamento
        greenSpaceCession: data.greenSpaceCession, // Loteamento
        // Project Specific
        landPlotId: data.landPlotId,
        projectType: data.projectType,
        architectName: data.architectName,
        workflowSteps: data.workflowSteps,
        // Announcement Specific
        announcementCategory: data.announcementCategory,
        // Croqui Specific
        croquiId: data.croquiId, // Link to a croqui
        croquiType: data.croquiType,
        croquiPoints: data.croquiPoints,
        croquiRoute: data.croquiRoute,
        collectionId: data.collectionId,
        collectionName: data.collectionName,
        customData: data.customData,
        // Duplicate detection
        potentialDuplicateOfId: data.potentialDuplicateOfId,
        // Sustainability
        sustainableSeal: data.sustainableSeal,
        sustainabilityFeatures: data.sustainabilityFeatures,
         // Maintenance
        maintenanceId: data.maintenanceId,
        cost: data.cost,
        partsCost: data.partsCost,
        laborCost: data.laborCost,
        // Health
        healthServices: data.healthServices,
        healthInspections: data.healthInspections,
        licensingStatus: data.licensingStatus,
        lastInspectionDate: data.lastInspectionDate,
        capacity: data.capacity,
        // Lighting Pole Specific
        lampType: data.lampType,
        poleType: data.poleType,
        poleHeight: data.poleHeight,
        // Green Area Specific
        greenAreaType: data.greenAreaType,
        lastPruning: data.lastPruning,
        lastIrrigation: data.lastIrrigation,
        pestStatus: data.pestStatus,
    };
};

const removeUndefinedFields = (obj: any): any => {
    const newObj: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            newObj[key] = value;
        }
    }
    return newObj;
};


export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [allData, setAllData] = useState<PointOfInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    const pointsCollectionRef = collection(db, 'pointsOfInterest');
    
    // Default query fetches all documents
    let q: Query = query(pointsCollectionRef, orderBy("lastReported", "desc"));

    // If a user is logged in, adjust the query based on their role
    if (profile) {
        // Super Admins see everything, so no filter needed.
        // Citizens also see everything that is public.
        // For other roles (Admin, Agent), we filter by organization.
        if (profile.role !== 'Super Administrador') {
            q = query(
                pointsCollectionRef,
                where("isPublic", "==", true)
            );

            // This part is a bit tricky with Firestore limitations.
            // We'll fetch public data and then merge private data for the user's organization client-side.
            // A more scalable solution might involve multiple queries or a different data structure.
        }
    }
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        let pointsData = querySnapshot.docs.map(convertDocToPointOfInterest);

        // For logged-in users who are not Super Admins, fetch their private data.
        if (profile && profile.organizationId && profile.role !== 'Super Administrador') {
             const privateQuery = query(
                pointsCollectionRef,
                where("organizationId", "==", profile.organizationId),
                where("isPublic", "==", false)
            );
            const privateSnapshot = await getDocs(privateQuery);
            const privateData = privateSnapshot.docs.map(convertDocToPointOfInterest);
            
            // Combine and remove duplicates
            const combinedData = [...pointsData, ...privateData];
            const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());
            pointsData = uniqueData.sort((a, b) => new Date(b.lastReported!).getTime() - new Date(a.lastReported!).getTime());
        }

        setAllData(pointsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching points of interest: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);


  const addPoint = async (point: Omit<PointOfInterest, 'updates' | 'organizationId'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] }, propertyIdToLink?: string) => {
    if (!profile) {
        toast({ variant: "destructive", title: "Erro de Permissão", description: "Não foi possível identificar o seu utilizador." });
        return;
    }
    try {
        const batch = writeBatch(db);

        // If it's a construction project linked to a land plot, lock the plot.
        if (point.type === 'construction' && point.landPlotId) {
            const projectsQuery = query(
                collection(db, 'pointsOfInterest'),
                where('landPlotId', '==', point.landPlotId),
                where('organizationId', '==', profile.organizationId),
                where('status', 'in', ['submitted', 'under_review', 'approved'])
            );
            const conflictingProjects = await getDocs(projectsQuery);
            if (!conflictingProjects.empty) {
                 toast({
                    variant: "destructive",
                    title: "Conflito de Submissão",
                    description: "Este lote já tem um processo de licenciamento ativo. Não é possível submeter um novo projeto.",
                });
                return; // Block submission
            }
            
            const landPlotRef = doc(db, "pointsOfInterest", point.landPlotId);
            batch.update(landPlotRef, { status: 'under_review' });
        }

        const pointRef = doc(db, 'pointsOfInterest', point.id);
        const completeUpdates = point.updates.map(u => {
            const cleanedUpdate = removeUndefinedFields(u);
            return {...cleanedUpdate, id: `upd-${point.id}-${Date.now()}-${Math.random()}`};
        });
        
        // Add organizationId to the point
        const pointWithOrg = {...point, organizationId: profile.organizationId || null};
        const pointWithCleanUpdates = {...pointWithOrg, updates: completeUpdates};
        const cleanedPoint = removeUndefinedFields(pointWithCleanUpdates);

        batch.set(pointRef, cleanedPoint);

        // If a croqui is being created and linked to a property, update the property.
        if (point.type === 'croqui' && propertyIdToLink) {
            const propertyRef = doc(db, 'pointsOfInterest', propertyIdToLink);
            batch.update(propertyRef, { croquiId: point.id });
        }

        await batch.commit();

    } catch (error) {
        console.error("Error adding point: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Submeter",
            description: "Ocorreu um erro ao guardar o seu ponto de interesse.",
        });
    }
  };

  const updatePointStatus = async (pointId: string, status: PointOfInterest['status'], updateText?: string, availableNotes?: number[], queueTime?: QueueTime, availableFuels?: string[], partsCost?: number, laborCost?: number) => {
    if (!user || !profile) {
      toast({ variant: "destructive", title: "Erro de Permissão", description: "Utilizador não autenticado." });
      return;
    }
    try {
        const pointRef = doc(db, 'pointsOfInterest', pointId);
        
        const text = updateText || `Estado atualizado para: ${statusLabelMap[status!] || status}`;

        const statusUpdate: Omit<PointOfInterestUpdate, 'id'> = {
            text: text,
            authorId: user.uid,
            authorDisplayName: profile.displayName || "Utilizador Anónimo",
            timestamp: new Date().toISOString(),
            availableNotes: availableNotes,
            queueTime: queueTime,
            availableFuels: availableFuels,
            partsCost: partsCost,
            laborCost: laborCost,
        };

        const updateWithId = {
            ...statusUpdate,
            id: `upd-${pointId}-${Date.now()}-${Math.random()}`
        }
        
        const updatePayload: Record<string, any> = {
            status: status,
            lastReported: new Date().toISOString(),
            updates: arrayUnion(removeUndefinedFields(updateWithId))
        };
        
        // If costs are provided, also update the main POI document
        if (partsCost !== undefined) {
            updatePayload.partsCost = partsCost;
        }
        if (laborCost !== undefined) {
            updatePayload.laborCost = laborCost;
        }
        if (partsCost !== undefined || laborCost !== undefined) {
            const currentPoint = allData.find(p => p.id === pointId);
            const currentTotalCost = currentPoint?.cost || 0;
            updatePayload.cost = currentTotalCost + (partsCost || 0) + (laborCost || 0);
        }

        await updateDoc(pointRef, updatePayload);
    } catch (error) {
        console.error("Error updating point status: ", error);
    }
  };

  const addUpdateToPoint = async (pointId: string, update: Omit<PointOfInterestUpdate, 'id'>) => {
    try {
        const pointRef = doc(db, 'pointsOfInterest', pointId);
        
        const newUpdateWithId: PointOfInterestUpdate = {
            ...update,
            id: `upd-${pointId}-${Date.now()}-${Math.random()}`
        };

        const cleanedUpdate = removeUndefinedFields(newUpdateWithId);
        
        await updateDoc(pointRef, {
            updates: arrayUnion(cleanedUpdate),
            lastReported: new Date().toISOString(), // Also update the main lastReported field
        });

    } catch (error) {
        console.error("Error adding update to point: ", error);
    }
  };

  const updatePointDetails = async (pointId: string, updates: Partial<Omit<PointOfInterest, 'id' | 'type' | 'authorId' | 'updates'>>) => {
    if (!user || !profile) {
        toast({ variant: "destructive", title: "Erro de Permissão", description: "Utilizador não autenticado." });
        return;
    }
    try {
        const pointRef = doc(db, 'pointsOfInterest', pointId);
        
        const { photoDataUri, ...otherUpdates } = updates as any;
        
        const cleanedData = removeUndefinedFields(otherUpdates);
        
        const editUpdate: Omit<PointOfInterestUpdate, 'id'> = {
            text: `Detalhes do item atualizados por ${profile.displayName}.`,
            authorId: user.uid,
            authorDisplayName: profile.displayName,
            timestamp: new Date().toISOString(),
            photoDataUri: photoDataUri,
        };

        // If there's a new photo, it should be part of the new update entry
        if(photoDataUri) {
            editUpdate.photoDataUri = photoDataUri;
        }
        
        // Add a general update to the timeline unless it's a workflow step change
        if (!cleanedData.workflowSteps && !cleanedData.hasOwnProperty('collectionName')) {
            const editUpdateWithId = {...editUpdate, id: `upd-${pointId}-${Date.now()}-${Math.random()}`};
            cleanedData.updates = arrayUnion(removeUndefinedFields(editUpdateWithId));
        }

        if (Object.keys(cleanedData).length > 0) {
             await updateDoc(pointRef, cleanedData);
        }

    } catch (error) {
        console.error("Error updating point details: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Atualizar",
            description: "Não foi possível guardar as alterações.",
        });
        throw error;
    }
  };
  
    const deletePoint = async (pointId: string) => {
        if (!profile || (profile.role !== 'Administrador' && profile.role !== 'Super Administrador')) {
            toast({ variant: "destructive", title: "Acesso Negado", description: "Apenas administradores podem eliminar reportes." });
            return;
        }

        try {
            const pointRef = doc(db, 'pointsOfInterest', pointId);
            await deleteDoc(pointRef);
            toast({ title: "Reporte Eliminado", description: "O ponto de interesse foi removido do sistema."});
        } catch (error) {
            console.error("Error deleting point: ", error);
            toast({ variant: "destructive", title: "Erro ao Eliminar", description: "Não foi possível eliminar o ponto de interesse."});
        }
    }


  return (
    <PointsContext.Provider value={{ allData, addPoint, updatePointStatus, addUpdateToPoint, updatePointDetails, deletePoint, loading }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
