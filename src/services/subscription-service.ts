

"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Subscription } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';

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
            setSubscription(null); // No organization, so no subscription.
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

// In a real application, you would have functions here to create/update subscriptions,
// likely interacting with a payment provider like Stripe via a backend function.
// e.g., export const createCheckoutSession = async (plan: string) => { ... };
