
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export interface Geofence {
    id: string;
    name: string;
    polygon: google.maps.LatLngLiteral[];
    createdAt: string;
    // Future rule fields
    // alertOn: 'entry' | 'exit' | 'both';
    // usersToNotify: string[];
}

// Hook to get all geofences in real-time
export const useGeofences = () => {
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const geofencesCollectionRef = collection(db, 'geofences');
        const q = query(geofencesCollectionRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const geofencesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Geofence));
            setGeofences(geofencesData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching geofences:", err);
            setError("Failed to load geofences.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { geofences, loading, error };
};

// Function to add or update a geofence
export const saveGeofence = async (geofence: Omit<Geofence, 'id' | 'createdAt'> & { id?: string }): Promise<void> => {
    try {
        if (geofence.id) {
            // Update existing
            const geofenceDocRef = doc(db, 'geofences', geofence.id);
            await updateDoc(geofenceDocRef, {
                name: geofence.name,
                polygon: geofence.polygon,
            });
        } else {
            // Add new
            await addDoc(collection(db, 'geofences'), {
                name: geofence.name,
                polygon: geofence.polygon,
                createdAt: new Date().toISOString(),
            });
        }
    } catch (err) {
        console.error("Error saving geofence:", err);
        throw new Error("Failed to save geofence.");
    }
};

// Function to delete a geofence
export const deleteGeofence = async (id: string): Promise<void> => {
    const geofenceDocRef = doc(db, 'geofences', id);
    try {
        await deleteDoc(geofenceDocRef);
    } catch (err) {
        console.error("Error deleting geofence:", err);
        throw new Error("Failed to delete geofence.");
    }
};
