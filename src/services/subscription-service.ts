
      

"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { Subscription, SubscriptionPlan } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { planDetails } from '@/lib/data';
import { addDays, formatISO } from 'date-fns';

// Hook to get the subscription for the current user's organization
export const useSubscription = () => {
    const { profile, loading: authLoading } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return; // Wait for authentication to resolve
        }

        if (!profile) {
            // If not loading and still no profile, it might be a non-org user or loading profile failed.
            setLoading(false);
            setSubscription(null);
            return;
        }

        if (!profile.organizationId) {
            setLoading(false);
            console.warn("User has a profile but no organization ID.");
            // For demo purposes, create a "free" virtual subscription if none exists
            setSubscription({
                id: 'virtual-free',
                organizationId: 'none',
                plan: 'free',
                status: 'active',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: addDays(new Date(), 30).toISOString(),
                cancelAtPeriodEnd: false,
                createdAt: new Date().toISOString(),
                limits: { agents: 5, storageGb: 1, apiCalls: 1000 },
            });
            return;
        }

        const subscriptionDocRef = doc(db, 'subscriptions', profile.organizationId);
        
        const unsubscribe = onSnapshot(subscriptionDocRef, (doc) => {
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

        return () => unsubscribe();
    }, [profile, authLoading]);

    return { subscription, loading, error };
};

// Function to change the subscription plan for an organization
export const changeSubscriptionPlan = async (organizationId: string, newPlan: SubscriptionPlan): Promise<void> => {
    const subscriptionDocRef = doc(db, 'subscriptions', organizationId);
    const newPlanDetails = planDetails[newPlan as keyof typeof planDetails];
    
    if (!newPlanDetails) {
        throw new Error("Invalid plan selected.");
    }
    
    const now = new Date();
    const nextMonth = addDays(now, 30);

    const updateData = {
        plan: newPlan,
        limits: newPlanDetails.limits,
        // In a real scenario, you'd handle prorating and billing cycles.
        // For this demo, we'll just reset the period.
        currentPeriodStart: formatISO(now),
        currentPeriodEnd: formatISO(nextMonth),
        status: 'active', // Assume payment is successful
    };

    try {
        await updateDoc(subscriptionDocRef, updateData);
    } catch (err) {
        console.error("Error changing subscription plan:", err);
        throw new Error("Failed to change subscription plan.");
    }
};


    