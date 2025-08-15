
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, DocumentData, query, orderBy } from 'firebase/firestore';
import { PointOfInterest, PointOfInterestUpdate } from '@/lib/data';

interface PointsContextType {
  allData: PointOfInterest[];
  addPoint: (point: PointOfInterest) => Promise<void>;
  updatePointStatus: (pointId: string, status: PointOfInterest['status']) => Promise<void>;
  addUpdateToPoint: (pointId: string, update: Omit<PointOfInterestUpdate, 'id'>) => Promise<void>;
  loading: boolean;
}

const PointsContext = createContext<PointsContextType>({
  allData: [],
  addPoint: async () => {},
  updatePointStatus: async () => {},
  addUpdateToPoint: async () => {},
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


  const addPoint = async (point: PointOfInterest) => {
    try {
        const pointRef = doc(db, 'pointsOfInterest', point.id);
        await setDoc(pointRef, point);
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
        
        const newUpdate: PointOfInterestUpdate = {
            id: `upd-${pointId}-${Date.now()}`,
            ...update // This now includes text, authorId, authorDisplayName, and optionally photoDataUri
        };
        
        await updateDoc(pointRef, {
            updates: arrayUnion(newUpdate),
            lastReported: new Date().toISOString(), // Also update the main lastReported field
        });

    } catch (error) {
        console.error("Error adding update to point: ", error);
    }
  };


  return (
    <PointsContext.Provider value={{ allData, addPoint, updatePointStatus, addUpdateToPoint, loading }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
