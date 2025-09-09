
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import type { SubscriptionPlan } from '@/lib/data';

// Hook to get all subscription plans in real-time
export const useSubscriptionPlans = () => {
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const plansCollectionRef = collection(db, 'subscriptionPlans');
        const q = query(plansCollectionRef, orderBy('price', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const plansData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as SubscriptionPlan));
            setSubscriptionPlans(plansData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching subscription plans:", err);
            setError("Failed to load subscription plans.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { subscriptionPlans, loading, error };
};

// Function to add or update a subscription plan
export const saveSubscriptionPlan = async (plan: Omit<SubscriptionPlan, 'id'> & { id?: string }): Promise<void> => {
    try {
        if (plan.id) {
            // Update existing plan
            const planDocRef = doc(db, 'subscriptionPlans', plan.id);
            await updateDoc(planDocRef, plan);
        } else {
            // Add new plan
            await addDoc(collection(db, 'subscriptionPlans'), plan);
        }
    } catch (err) {
        console.error("Error saving subscription plan:", err);
        throw new Error("Failed to save subscription plan.");
    }
};
