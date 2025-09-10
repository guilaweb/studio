

"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PointOfInterest, UserProfile } from '@/lib/data';

export const useUsers = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const usersCollectionRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            const usersData = snapshot.docs.map((doc, index) => {
                const data = doc.data();
                // Ensure vehicle and maintenancePlanIds exist for agents
                if (data.role === 'Agente Municipal' && data.vehicle && !data.vehicle.maintenancePlanIds) {
                    data.vehicle.maintenancePlanIds = [];
                }
                return {
                    uid: doc.id,
                    ...data
                } as UserProfile;
            });
            setUsers(usersData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching users:", err);
            setError("Failed to load users.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateUserRole = useCallback(async (uid: string, role: UserProfile['role']) => {
        const userDocRef = doc(db, 'users', uid);
        try {
            await updateDoc(userDocRef, { role });
        } catch (err) {
            console.error("Error updating user role:", err);
            throw new Error("Failed to update user role.");
        }
    }, []);

    const updateUserProfile = useCallback(async (uid: string, profileData: Partial<UserProfile>) => {
        const userDocRef = doc(db, 'users', uid);
        try {
            await updateDoc(userDocRef, profileData);
        } catch (err) {
            console.error("Error updating user profile:", err);
            throw new Error("Failed to update user profile.");
        }
    }, []);


    return { users, loading, error, updateUserRole, updateUserProfile };
};


export const useUserProfile = (userId: string | null) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setUser(null);
            setLoading(false);
            return;
        }

        const userDocRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const userData = { uid: doc.id, ...doc.data() } as UserProfile;
                 if (userData.role === 'Agente Municipal' && userData.vehicle && !userData.vehicle.maintenancePlanIds) {
                    userData.vehicle.maintenancePlanIds = [];
                }
                setUser(userData);
            } else {
                setError("User not found.");
                setUser(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching user profile:", err);
            setError("Failed to load user profile.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { user, loading, error };
};
