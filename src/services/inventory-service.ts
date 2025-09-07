
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import { InventoryPartSchema, type InventoryPart } from '@/lib/data';

// Hook to get all inventory parts in real-time
export const useInventory = () => {
    const [inventory, setInventory] = useState<InventoryPart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const inventoryCollectionRef = collection(db, 'inventoryParts');
        const q = query(inventoryCollectionRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const partsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as InventoryPart));
            setInventory(partsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching inventory:", err);
            setError("Failed to load inventory.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { inventory, loading, error };
};

// Function to add a new part to the inventory
export const addInventoryPart = async (part: Omit<InventoryPart, 'id' | 'createdAt'>): Promise<void> => {
    try {
        const inventoryCollectionRef = collection(db, 'inventoryParts');
        await addDoc(inventoryCollectionRef, {
            ...part,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Error adding inventory part:", err);
        throw new Error("Failed to add inventory part.");
    }
};

// Function to update the stock of a part
export const updatePartStock = async (partId: string, newStock: number): Promise<void> => {
    const partDocRef = doc(db, 'inventoryParts', partId);
    try {
        await updateDoc(partDocRef, { stock: newStock });
    } catch (err) {
        console.error("Error updating part stock:", err);
        throw new Error("Failed to update part stock.");
    }
};

// Function to delete a part from the inventory
export const deleteInventoryPart = async (id: string): Promise<void> => {
    const partDocRef = doc(db, 'inventoryParts', id);
    try {
        await deleteDoc(partDocRef);
    } catch (err) {
        console.error("Error deleting inventory part:", err);
        throw new Error("Failed to delete inventory part.");
    }
};
