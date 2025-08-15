
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/data';

export const useUsers = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const usersCollectionRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            } as UserProfile));
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

    return { users, loading, error, updateUserRole };
};
