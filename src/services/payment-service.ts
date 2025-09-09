
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { Payment } from '@/lib/data';

// Hook to get payment history for the current user's organization
export const usePayments = () => {
    const { profile, loading: authLoading } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!profile?.organizationId) {
            setLoading(false);
            return;
        }

        const paymentsRef = collection(db, 'payments');
        const q = query(
            paymentsRef,
            where("organizationId", "==", profile.organizationId),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const paymentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Payment));
            setPayments(paymentsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching payments:", err);
            setError("Failed to load payment history.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profile, authLoading]);

    return { payments, loading, error };
};
