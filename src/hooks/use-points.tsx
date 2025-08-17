

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, DocumentData, query, orderBy, writeBatch, getDocs, where } from 'firebase/firestore';
import { PointOfInterest, PointOfInterestUpdate } from '@/lib/data';
import { useToast } from './use-toast';

interface PointsContextType {
  allData: PointOfInterest[];
  addPoint: (point: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] }) => Promise<void>;
  updatePointStatus: (pointId: string, status: PointOfInterest['status']) => Promise<void>;
  addUpdateToPoint: (pointId: string, update: Omit<PointOfInterestUpdate, 'id'>) => Promise<void>;
  updatePointDetails: (pointId: string, updates: Partial<Omit<PointOfInterest, 'id' | 'type' | 'authorId' | 'updates'>>) => Promise<void>;
  loading: boolean;
}

const PointsContext = createContext<PointsContextType>({
  allData: [],
  addPoint: async () => {},
  updatePointStatus: async () => {},
  addUpdateToPoint: async () => {},
  updatePointDetails: async () => {},
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
        plotNumber: data.plotNumber,
        registrationCode: data.registrationCode,
        zoningInfo: data.zoningInfo,
        usageType: data.usageType,
        maxHeight: data.maxHeight,
        buildingRatio: data.buildingRatio,
        landPlotId: data.landPlotId,
        projectType: data.projectType,
        architectName: data.architectName,
        announcementCategory: data.announcementCategory,
    };
};


export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [allData, setAllData] = useState<PointOfInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        // Anti-conflict validator for construction projects
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
        }

        const pointRef = doc(db, 'pointsOfInterest', point.id);
        const completeUpdates = point.updates.map(u => ({...u, id: `upd-${point.id}-${Date.now()}-${Math.random()}`}));
        const pointToAdd: PointOfInterest = {...point, updates: completeUpdates};
        
        // Remove undefined fields before sending to Firestore
        const cleanedPoint = Object.fromEntries(
            Object.entries(pointToAdd).filter(([, value]) => value !== undefined)
        );

        await setDoc(pointRef, cleanedPoint);
    } catch (error) {
        console.error("Error adding point: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Submeter",
            description: "Ocorreu um erro ao guardar o seu ponto de interesse.",
        });
    }
  };

  const updatePointStatus = async (pointId: string, status: PointOfInterest['status']) => {
    try {
        const pointRef = doc(db, 'pointsOfInterest', pointId);
        await updateDoc(pointRef, {
            status: status,
            lastReported: new Date().toISOString()
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

        // Remove undefined fields before sending to Firestore
        const cleanedUpdate = Object.fromEntries(
            Object.entries(newUpdateWithId).filter(([, value]) => value !== undefined)
        );
        
        await updateDoc(pointRef, {
            updates: arrayUnion(cleanedUpdate),
            lastReported: new Date().toISOString(), // Also update the main lastReported field
        });

    } catch (error) {
        console.error("Error adding update to point: ", error);
    }
  };

  const updatePointDetails = async (pointId: string, updates: Partial<Omit<PointOfInterest, 'id' | 'type' | 'authorId' | 'updates'>>) => {
    try {
        const pointRef = doc(db, 'pointsOfInterest', pointId);
        
        const { photoDataUri, ...otherUpdates } = updates as any;

        const dataToUpdate: Partial<PointOfInterest> & { updates?: PointOfInterestUpdate[], status?: PointOfInterest['status'] } = {
            ...otherUpdates,
        };

        if ('status' in updates) {
            dataToUpdate.status = updates.status;
        }

        // Handle photo update specifically for incident/atm types
        if (photoDataUri) {
            const pointToUpdate = allData.find(p => p.id === pointId);
            if (pointToUpdate?.updates && pointToUpdate.updates.length > 0) {
                // Create a mutable copy of updates and sort chronologically
                const newUpdates = [...pointToUpdate.updates].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                
                // Update the photo on the original update
                newUpdates[0] = { ...newUpdates[0], photoDataUri: photoDataUri };
                
                // Sort back to newest first for Firestore
                dataToUpdate.updates = newUpdates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); 
            }
        }
        
        // Remove undefined fields before sending to Firestore
        const cleanedData = Object.fromEntries(
            Object.entries(dataToUpdate).filter(([, value]) => value !== undefined)
        );

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
    }
  };


  return (
    <PointsContext.Provider value={{ allData, addPoint, updatePointStatus, addUpdateToPoint, updatePointDetails, loading }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
