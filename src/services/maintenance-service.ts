
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';

export interface MaintenancePlan {
    id: string;
    name: string;
    type: 'distance' | 'time'; // distance in km, time in months
    interval: number;
    createdAt: string;
}

// Hook to get all maintenance plans in real-time
export const useMaintenancePlans = () => {
    const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const plansCollectionRef = collection(db, 'maintenancePlans');
        const q = query(plansCollectionRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const plansData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as MaintenancePlan));
            setMaintenancePlans(plansData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching maintenance plans:", err);
            setError("Failed to load maintenance plans.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { maintenancePlans, loading, error };
};

// Function to add a new maintenance plan
export const addMaintenancePlan = async (name: string, type: MaintenancePlan['type'], interval: number): Promise<void> => {
    try {
        const plansCollectionRef = collection(db, 'maintenancePlans');
        await addDoc(plansCollectionRef, {
            name,
            type,
            interval,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Error adding maintenance plan:", err);
        throw new Error("Failed to add maintenance plan.");
    }
};

// Function to delete a maintenance plan
export const deleteMaintenancePlan = async (id: string): Promise<void> => {
    const planDocRef = doc(db, 'maintenancePlans', id);
    try {
        await deleteDoc(planDocRef);
    } catch (err) {
        console.error("Error deleting maintenance plan:", err);
        throw new Error("Failed to delete maintenance plan.");
    }
};

    