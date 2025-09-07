
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { FuelEntry } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';

// Hook to get all fuel entries in real-time
export const useFuelEntries = () => {
    const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const entriesCollectionRef = collection(db, 'fuelEntries');
        const q = query(entriesCollectionRef, orderBy('date', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FuelEntry));
            setFuelEntries(entriesData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching fuel entries:", err);
            setError("Failed to load fuel entries.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { fuelEntries, loading, error };
};

// Function to add a new fuel entry
export const addFuelEntry = async (entry: Omit<FuelEntry, 'id' | 'createdAt'>): Promise<void> => {
    try {
        const entriesCollectionRef = collection(db, 'fuelEntries');
        await addDoc(entriesCollectionRef, {
            ...entry,
            createdAt: new Date().toISOString(),
        });
        
        // Also update the vehicle's odometer
        const userDocRef = doc(db, 'users', entry.vehicleId);
        await updateDoc(userDocRef, {
            'vehicle.odometer': entry.odometer,
        });

    } catch (err) {
        console.error("Error adding fuel entry:", err);
        throw new Error("Failed to add fuel entry.");
    }
};
