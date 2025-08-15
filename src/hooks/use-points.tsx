
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, DocumentData } from 'firebase/firestore';
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
    return {
        id: doc.id,
        type: data.type,
        position: data.position,
        title: data.title,
        description: data.description,
        status: data.status,
        lastReported: data.lastReported,
        authorId: data.authorId,
        updates: data.updates || [],
    };
};


export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [allData, setAllData] = useState<PointOfInterest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pointsCollectionRef = collection(db, 'pointsOfInterest');
    
    const unsubscribe = onSnapshot(pointsCollectionRef, (querySnapshot) => {
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
            text: update.text,
            authorId: update.authorId,
            timestamp: update.timestamp,
            id: `upd-${pointId}-${Date.now()}`,
        };
        
        if (update.photoDataUri) {
            newUpdate.photoDataUri = update.photoDataUri;
        }

        await updateDoc(pointRef, {
            updates: arrayUnion(newUpdate)
        });

    } catch (error) {
        console.error("Error adding update to point: ", error);
    }
  };

  // This is a client-side sort. For large datasets, consider sorting with Firestore queries.
  const sortedData = [...allData].sort((a, b) => {
      const dateA = a.updates?.[0]?.timestamp || a.lastReported || '1970-01-01';
      const dateB = b.updates?.[0]?.timestamp || b.lastReported || '1970-01-01';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
  });


  return (
    <PointsContext.Provider value={{ allData: sortedData, addPoint, updatePointStatus, addUpdateToPoint, loading }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
