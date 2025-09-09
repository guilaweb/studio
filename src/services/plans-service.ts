
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, query, orderBy, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import type { SubscriptionPlan } from '@/lib/data';

// --- New Seeding Function ---
const seedDefaultPlans = async () => {
    const plansCollectionRef = collection(db, 'subscriptionPlans');
    const batch = writeBatch(db);

    const plans: SubscriptionPlan[] = [
        {
            id: 'free',
            name: 'Plano Gratuito',
            description: 'Para experimentar a plataforma e para pequenas equipas.',
            price: 0,
            currency: 'AOA',
            limits: { agents: 2, storageGb: 1, apiCalls: 1000 },
            features: ['Até 2 agentes', '1GB de armazenamento'],
            active: true,
        },
        {
            id: 'professional',
            name: 'Plano Profissional',
            description: 'Ideal para municípios de média dimensão e empresas.',
            price: 50000,
            currency: 'AOA',
            limits: { agents: 10, storageGb: 10, apiCalls: 10000 },
            features: ['Até 10 agentes', '10GB de armazenamento', 'Suporte prioritário'],
            active: true,
        },
        {
            id: 'enterprise',
            name: 'Plano Empresarial',
            description: 'Soluções à medida para grandes organizações.',
            price: 250000,
            currency: 'AOA',
            limits: { agents: -1, storageGb: -1, apiCalls: -1 }, // -1 for unlimited
            features: ['Agentes ilimitados', 'Armazenamento ilimitado', 'API e integrações'],
            active: true,
        },
    ];

    plans.forEach(plan => {
        const docRef = doc(db, 'subscriptionPlans', plan.id);
        batch.set(docRef, plan);
    });

    await batch.commit();
    console.log("Default subscription plans have been seeded.");
};


// Hook to get all subscription plans in real-time
export const useSubscriptionPlans = () => {
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const plansCollectionRef = collection(db, 'subscriptionPlans');
        
        const checkAndSeed = async () => {
            const snapshot = await getDocs(plansCollectionRef);
            if (snapshot.empty) {
                console.log("No subscription plans found. Seeding default plans...");
                try {
                    await seedDefaultPlans();
                } catch (seedError) {
                    console.error("Failed to seed default plans:", seedError);
                    setError("Failed to initialize default plans.");
                }
            }
        };

        checkAndSeed().then(() => {
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

            return unsubscribe;
        });

    // This effect should only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { subscriptionPlans, loading, error };
};

// Function to add or update a subscription plan
export const saveSubscriptionPlan = async (plan: SubscriptionPlan, isEditing: boolean): Promise<void> => {
    try {
        const planDocRef = doc(db, 'subscriptionPlans', plan.id);
        // Using merge:true for updates is safer as it won't overwrite fields not included in the form.
        // For creation, a simple setDoc is sufficient.
        if (isEditing) {
            await setDoc(planDocRef, plan, { merge: true });
        } else {
            await setDoc(planDocRef, { ...plan, active: true });
        }
    } catch (err) {
        console.error("Error saving subscription plan:", err);
        throw new Error("Failed to save subscription plan.");
    }
};
