
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import type { InstitutionalRequest } from '@/lib/data';

// Hook to get all institutional requests in real-time
export const useInstitutionalRequests = () => {
    const [requests, setRequests] = useState<InstitutionalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const requestsCollectionRef = collection(db, 'institutionalRequests');
        const q = query(requestsCollectionRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as InstitutionalRequest));
            setRequests(requestsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching institutional requests:", err);
            setError("Failed to load institutional requests.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
        const requestDocRef = doc(db, 'institutionalRequests', id);
        try {
            await updateDoc(requestDocRef, { status });
            // In a real app, you would also trigger an email notification here
        } catch (err) {
            console.error("Error updating request status:", err);
            throw new Error("Failed to update request status.");
        }
    };


    return { requests, loading, error, updateRequestStatus };
};
