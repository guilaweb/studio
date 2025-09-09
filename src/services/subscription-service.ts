
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, addDoc, setDoc } from 'firebase/firestore';
import type { Subscription, SubscriptionPlan, UserProfile } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { addDays, formatISO } from 'date-fns';
import { usePoints } from '@/hooks/use-points';

interface UsageData {
    agents: number;
    storage: number; // in GB
    apiCalls: number; // For the current month
}

// Hook to get the subscription and usage for the current user's organization
export const useSubscription = () => {
    const { profile, loading: authLoading } = useAuth();
    const { allData } = usePoints();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<UsageData>({ agents: 0, storage: 0, apiCalls: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return; // Wait for authentication to resolve
        }

        if (!profile) {
            setLoading(false);
            setSubscription(null);
            return;
        }

        if (!profile.organizationId) {
            setLoading(false);
            console.warn("User has a profile but no organization ID.");
            setSubscription({
                id: 'virtual-free',
                organizationId: 'none',
                planId: 'free',
                status: 'active',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: addDays(new Date(), 30).toISOString(),
                cancelAtPeriodEnd: false,
                createdAt: new Date().toISOString(),
            });
            return;
        }

        const subscriptionDocRef = doc(db, 'subscriptions', profile.organizationId);
        
        const unsubscribeSub = onSnapshot(subscriptionDocRef, (doc) => {
            if (doc.exists()) {
                setSubscription({ id: doc.id, ...doc.data() } as Subscription);
            } else {
                console.error(`CRITICAL: Subscription for organization ${profile.organizationId} not found.`);
                setError("Subscription not found.");
                setSubscription(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching subscription:", err);
            setError("Failed to load subscription details.");
            setLoading(false);
        });

        // Fetch usage data
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where("organizationId", "==", profile.organizationId), where("role", "==", "Agente Municipal"));

        const unsubscribeUsage = onSnapshot(q, (snapshot) => {
            // Here we use the total number of points as a proxy for API calls and storage
            // In a real app, this would be tracked by backend services.
            const storageUsageGB = parseFloat((JSON.stringify(allData).length / (1024 * 1024 * 1024)).toFixed(4));
            
            setUsage({ 
                agents: snapshot.size,
                storage: storageUsageGB,
                apiCalls: allData.length * 5, // A simple proxy for API calls
            });
        });

        return () => {
            unsubscribeSub();
            unsubscribeUsage();
        };
    }, [profile, authLoading, allData]);

    return { subscription, usage, loading, error };
};

// Function to change the subscription plan for an organization
export const changeSubscriptionPlan = async (organizationId: string, newPlan: SubscriptionPlan): Promise<void> => {
    const subscriptionDocRef = doc(db, 'subscriptions', organizationId);
    
    if (!newPlan) {
        throw new Error("Invalid plan selected.");
    }
    
    const now = new Date();
    const nextMonth = addDays(now, 30);

    const updateData = {
        planId: newPlan.id,
        currentPeriodStart: formatISO(now),
        currentPeriodEnd: formatISO(nextMonth),
        status: 'active',
        limits: newPlan.limits, // Also update the limits on the subscription document itself
    };

    try {
        await updateDoc(subscriptionDocRef, updateData);

        // Add a record to the payment history
        const paymentsCollectionRef = collection(db, 'payments');
        await addDoc(paymentsCollectionRef, {
            organizationId,
            amount: newPlan.price,
            date: now.toISOString(),
            planId: newPlan.id,
            status: 'completed',
            description: `Subscrição do plano ${newPlan.name}`,
        });

    } catch (err) {
        console.error("Error changing subscription plan:", err);
        throw new Error("Failed to change subscription plan.");
    }
};

// Function to create a default subscription for a new organization
export const createDefaultSubscription = async (organizationId: string, plan: SubscriptionPlan): Promise<void> => {
    const subscriptionDocRef = doc(db, 'subscriptions', organizationId);
    const now = new Date();
    const nextMonth = addDays(new Date(), 30);

    const defaultSubscription: Omit<Subscription, 'id'> = {
        organizationId,
        planId: plan.id,
        status: 'trialing',
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: nextMonth.toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: now.toISOString(),
        limits: plan.limits,
    };
    await setDoc(subscriptionDocRef, defaultSubscription);
};
