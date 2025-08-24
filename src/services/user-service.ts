
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
                const user = {
                    uid: doc.id,
                    ...doc.data()
                } as UserProfile;

                // This section simulates real-time data that would come from a mobile app
                // Location is now handled by the drag-and-drop simulation on the map
                if (user.role === 'Agente Municipal') {
                    const statuses: UserProfile['status'][] = ['Disponível', 'Em Rota', 'Ocupado', 'Offline'];
                    const teams: UserProfile['team'][] = ['Eletricidade', 'Saneamento', 'Geral'];
                    
                    user.status = user.status || statuses[index % statuses.length];
                    // Location is now sourced from Firestore, updated by the simulation.
                    // If a technician has no location, they won't appear on the map until moved.
                    user.location = user.location || { lat: -8.82 + (Math.random() * 0.1), lng: 13.23 + (Math.random() * 0.1) };
                    user.team = user.team || teams[index % teams.length];
                    user.vehicle = user.vehicle || { type: 'Carrinha de Manutenção', plate: `LD-${index < 10 ? '0' : ''}${index}-00-AA` };
                    user.currentTask = user.currentTask === undefined ? null : user.currentTask;
                    user.taskQueue = user.taskQueue || [];
                    user.stats = user.stats || { completed: Math.floor(Math.random() * 5), avgTime: `${20 + Math.floor(Math.random() * 20)} min` };
                    user.path = user.path || [
                        { lat: -8.82 + (index * 0.01) - 0.002, lng: 13.23 + (index * 0.01) - 0.002 },
                        { lat: -8.82 + (index * 0.01), lng: 13.23 + (index * 0.01) }
                    ];
                    user.phoneNumber = user.phoneNumber || `92300000${index}`;
                }
                return user;
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
                setUser({ uid: doc.id, ...doc.data() } as UserProfile);
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

    