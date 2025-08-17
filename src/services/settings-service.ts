
"use client";

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ActiveLayers } from '@/lib/data';

const SETTINGS_DOC_ID = 'publicLayerConfig';

const initialPublicLayers: ActiveLayers = {
    atm: true,
    construction: true,
    incident: true,
    sanitation: true,
    water: false,
    land_plot: false,
    announcement: true,
};

// Hook to read public layer settings
export const usePublicLayerSettings = () => {
    const [publicLayers, setPublicLayers] = useState<ActiveLayers>(initialPublicLayers);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const settingsDocRef = doc(db, 'settings', SETTINGS_DOC_ID);
        const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
            if (doc.exists()) {
                setPublicLayers(doc.data() as ActiveLayers);
            } else {
                // If the document doesn't exist, you might want to initialize it
                console.log("Settings document not found, using initial settings.");
                setPublicLayers(initialPublicLayers);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching settings:", err);
            setError("Failed to load settings.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { publicLayers, loading, error };
};

// Function to update public layer settings
export const updatePublicLayerSettings = async (layers: ActiveLayers): Promise<void> => {
    const settingsDocRef = doc(db, 'settings', SETTINGS_DOC_ID);
    try {
        await setDoc(settingsDocRef, layers, { merge: true });
    } catch (err) {
        console.error("Error updating settings:", err);
        throw new Error("Failed to update settings.");
    }
};
