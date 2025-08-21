

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, DocumentData, query, orderBy, writeBatch, getDocs, where, deleteDoc } from 'firebase/firestore';
import { PointOfInterest, PointOfInterestUpdate, QueueTime, statusLabelMap } from '@/lib/data';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

interface PointsContextType {
  allData: PointOfInterest[];
  addPoint: (point: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] }) => Promise<void>;
  updatePointStatus: (pointId: string, status: PointOfInterest['status'], updateText?: string, availableNotes?: number[], queueTime?: QueueTime) => Promise<void>;
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
        type: data.type,
        position: data.position,
        polygon: data.polygon,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        lastReported: data.lastReported,
        incidentDate: data.incidentDate,
        startDate: data.startDate,
        endDate: data.endDate,
        authorId: data.authorId,
        authorDisplayName: data.authorDisplayName,
        updates: sortedUpdates,
        files: data.files,
        // Land Plot & Property Specific
        price: data.price,
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
        propertyTaxStatus: data.propertyTaxStatus,
        // Project Specific
        landPlotId: data.landPlotId,
        projectType: data.projectType,
        architectName: data.architectName,
        // Announcement Specific
        announcementCategory: data.announcementCategory,
        // Duplicate detection
        potentialDuplicateOfId: data.potentialDuplicateOfId,
        // Sustainability
        sustainableSeal: data.sustainableSeal,
        sustainabilityFeatures: data.sustainabilityFeatures,
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
    // Query for points of interest, ordered by lastReported date descending
    const q = query(pointsCollectionRef, orderBy("lastReported", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const pointsData = querySnapshot.docs.map(convertDocToPointOfInterest);
        setAllData(pointsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching points of interest: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const addPoint = async (point: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] }) => {
    try {
        const batch = writeBatch(db);

        // If it's a construction project linked to a land plot, lock the plot.
        if (point.type === 'construction' && point.landPlotId) {
            const projectsQuery = query(
                collection(db, 'pointsOfInterest'),
                where('landPlotId', '==', point.landPlotId),
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
        
        const pointWithCleanUpdates = {...point, updates: completeUpdates};
        const cleanedPoint = removeUndefinedFields(pointWithCleanUpdates);

        batch.set(pointRef, cleanedPoint);

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

  const updatePointStatus = async (pointId: string, status: PointOfInterest['status'], updateText?: string, availableNotes?: number[], queueTime?: QueueTime) => {
    if (!user || !profile) {
      toast({ variant: "destructive", title: "Erro de Permissão", description: "Utilizador não autenticado." });
      return;
    }
    try {
        const pointRef = doc(db, 'pointsOfInterest', pointId);
        
        const statusUpdate: Partial<PointOfInterestUpdate> = {
            text: updateText || `Estado atualizado para: ${statusLabelMap[status!] || status}`,
            authorId: user.uid,
            authorDisplayName: profile.displayName || "Utilizador Anónimo",
            timestamp: new Date().toISOString(),
            availableNotes: availableNotes,
            queueTime: queueTime,
        };

        const updateWithId = {
            ...statusUpdate,
            id: `upd-${pointId}-${Date.now()}-${Math.random()}`
        }

        await updateDoc(pointRef, {
            status: status,
            lastReported: new Date().toISOString(),
            updates: arrayUnion(removeUndefinedFields(updateWithId))
        });
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

        // Add a new update to the timeline to log the edit
        const editUpdate: Omit<PointOfInterestUpdate, 'id'> = {
            text: `Detalhes do item atualizados por ${profile.displayName}.`,
            authorId: user.uid,
            authorDisplayName: profile.displayName,
            timestamp: new Date().toISOString(),
        };

        const editUpdateWithId = {...editUpdate, id: `upd-${pointId}-${Date.now()}-${Math.random()}`};
        
        const cleanedData = removeUndefinedFields({
            ...otherUpdates,
            updates: arrayUnion(removeUndefinedFields(editUpdateWithId))
        });

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
        if (!profile || profile.role !== 'Administrador') {
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

    


