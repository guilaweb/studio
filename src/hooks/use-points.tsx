
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, DocumentData, query, orderBy, writeBatch } from 'firebase/firestore';
import { PointOfInterest, PointOfInterestUpdate } from '@/lib/data';

interface PointsContextType {
  allData: PointOfInterest[];
  addPoint: (point: Omit<PointOfInterest, 'updates'> & { updates: Omit<PointOfInterestUpdate, 'id'>[] }) => Promise<void>;
  updatePointStatus: (pointId: string, status: PointOfInterest['status']) => Promise<void>;
  addUpdateToPoint: (pointId: string, update: Omit<PointOfInterestUpdate, 'id'>) => Promise<void>;
  updatePointDetails: (pointId: string, updates: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'incidentDate'> & { photoDataUri?: string }) => Promise<void>;
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
        title: data.title,
        description: data.description,
        status: data.status,
        lastReported: data.lastReported,
        authorId: data.authorId,
        updates: sortedUpdates,
        priority: data.priority,
        incidentDate: data.incidentDate,
    };
};


export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [allData, setAllData] = useState<PointOfInterest[]>([]);
  const [loading, setLoading] = useState(true);

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
        const pointRef = doc(db, 'pointsOfInterest', point.id);
        const completeUpdates = point.updates.map(u => ({...u, id: `upd-${point.id}-${Date.now()}`}));
        const pointToAdd: PointOfInterest = {...point, updates: completeUpdates};
        await setDoc(pointRef, pointToAdd);
    } catch (error) {
        console.error("Error adding point: ", error);
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
            id: `upd-${pointId}-${Date.now()}`
        };
        
        await updateDoc(pointRef, {
            updates: arrayUnion(newUpdateWithId),
            lastReported: new Date().toISOString(), // Also update the main lastReported field
        });

    } catch (error) {
        console.error("Error adding update to point: ", error);
    }
  };

  const updatePointDetails = async (pointId: string, updates: Pick<PointOfInterest, 'title' | 'description' | 'position' | 'incidentDate'> & { photoDataUri?: string }) => {
    try {
        const pointRef = doc(db, 'pointsOfInterest', pointId);
        
        const dataToUpdate: Partial<PointOfInterest> & { 'updates.0.photoDataUri'?: string } = {
            title: updates.title,
            description: updates.description,
            position: updates.position,
            incidentDate: updates.incidentDate,
        };

        const pointToUpdate = allData.find(p => p.id === pointId);
        
        if (updates.photoDataUri && pointToUpdate && pointToUpdate.updates && pointToUpdate.updates.length > 0) {
            const originalUpdateIndex = pointToUpdate.updates.length - 1;
            const newUpdates = [...pointToUpdate.updates];
            newUpdates[originalUpdateIndex] = {
                ...newUpdates[originalUpdateIndex],
                photoDataUri: updates.photoDataUri,
            };
            dataToUpdate.updates = newUpdates;
        }


        await updateDoc(pointRef, dataToUpdate);

    } catch (error) {
        console.error("Error updating point details: ", error);
    }
  };


  return (
    <PointsContext.Provider value={{ allData, addPoint, updatePointStatus, addUpdateToPoint, updatePointDetails, loading }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
