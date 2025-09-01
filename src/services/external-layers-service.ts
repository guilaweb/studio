
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface ExternalLayer {
    id: string;
    name: string;
    url: string;
    type: 'wms';
    visible: boolean;
    createdAt: string;
}

// Hook to get all external layers in real-time
export const useExternalLayers = () => {
    const [externalLayers, setExternalLayers] = useState<ExternalLayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const layersCollectionRef = collection(db, 'externalLayers');
        const unsubscribe = onSnapshot(layersCollectionRef, (snapshot) => {
            const layersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ExternalLayer));
            setExternalLayers(layersData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching external layers:", err);
            setError("Failed to load external layers.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { externalLayers, loading, error };
};

// Function to add a new external layer
export const addExternalLayer = async (name: string, url: string, type: 'wms'): Promise<void> => {
    try {
        const layersCollectionRef = collection(db, 'externalLayers');
        await addDoc(layersCollectionRef, {
            name,
            url,
            type,
            visible: true,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Error adding external layer:", err);
        throw new Error("Failed to add external layer.");
    }
};

// Function to update the visibility of an external layer
export const updateExternalLayerVisibility = async (id: string, visible: boolean): Promise<void> => {
    const layerDocRef = doc(db, 'externalLayers', id);
    try {
        await updateDoc(layerDocRef, { visible });
    } catch (err) {
        console.error("Error updating layer visibility:", err);
        throw new Error("Failed to update layer visibility.");
    }
};


// Function to delete an external layer
export const deleteExternalLayer = async (id: string): Promise<void> => {
    const layerDocRef = doc(db, 'externalLayers', id);
    try {
        await deleteDoc(layerDocRef);
    } catch (err) {
        console.error("Error deleting layer:", err);
        throw new Error("Failed to delete layer.");
    }
};
