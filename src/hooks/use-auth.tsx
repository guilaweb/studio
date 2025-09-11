
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, setDoc, getDoc, collection, query, where, getDocs, runTransaction, getDocsFromCache, updateDoc } from 'firebase/firestore';
import type { UserProfile, Subscription, SubscriptionPlan, SubscriptionStatus } from '@/lib/data';
import { useToast } from './use-toast';
import { useSubscriptionPlans } from '@/services/plans-service';
import { createDefaultSubscription } from '@/services/subscription-service';


interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: () => {},
});

// Helper function to create a default organization and subscription for the first admin
const createDefaultOrganizationAndSubscription = async (userId: string, orgName: string, defaultPlan: SubscriptionPlan | undefined): Promise<string> => {
    const organizationId = `org_${userId.substring(0, 10)}`;
    const orgDocRef = doc(db, 'organizations', organizationId);
    const orgDoc = await getDoc(orgDocRef);
    
    if (!orgDoc.exists()) {
        await setDoc(orgDocRef, {
            name: orgName,
            ownerId: userId,
            createdAt: new Date().toISOString(),
        });

        if (defaultPlan) {
            await createDefaultSubscription(organizationId, defaultPlan);
        } else {
             console.error("CRITICAL: Default 'free' plan not found. Cannot create subscription.");
             throw new Error("Default plan is missing.");
        }
    }
    return organizationId;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { subscriptionPlans, loading: loadingPlans } = useSubscriptionPlans();
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user && !loadingPlans) { // Wait for plans to be loaded
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                let profileData = docSnap.data() as UserProfile;

                // Onboarding for the very first admin user
                if (profileData.role === 'Administrador' && !profileData.organizationId) {
                    setLoading(true); // Hold loading state while we create the org
                    
                    try {
                        const orgName = `${profileData.displayName}'s Municipality`;
                        const freePlan = subscriptionPlans.find(p => p.id === 'free');
                        const organizationId = await createDefaultOrganizationAndSubscription(user.uid, orgName, freePlan);
                        
                        // Update the user's profile with the new org ID
                        await updateDoc(userDocRef, { organizationId: organizationId, onboardingCompleted: false });
                        profileData.organizationId = organizationId;
                        profileData.onboardingCompleted = false;

                    } catch (e) {
                         console.error("Failed to create organization for first admin:", e);
                    }
                }

                setProfile(profileData);
            } else {
                // This case handles a user who signed in with Google but doesn't have a profile yet.
                // The registration page flow should handle profile creation.
                // If they land somewhere else, we treat them as not having a profile.
                setProfile(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setProfile(null);
            setLoading(false);
        });

        return () => unsubscribeProfile();
    }
  }, [user, loadingPlans, subscriptionPlans]);


  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const withAuth = <P extends object>(
    Component: React.ComponentType<P>,
    allowedRoles?: UserProfile['role'][]
) => {
  const AuthComponent = (props: P) => {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
      if (loading) return; 

      if (!user) {
        router.push('/login');
        return;
      }
      
      if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        toast({
            variant: "destructive",
            title: "Acesso Negado",
            description: "Não tem permissão para aceder a esta página.",
        })
        router.push('/');
      }

    }, [user, profile, loading, router, toast]);

    if (loading || !user || (allowedRoles && (!profile || !allowedRoles.includes(profile.role)))) {
      return <div className="flex h-screen w-full items-center justify-center">A carregar...</div>; 
    }

    return <Component {...props} />;
  };
  AuthComponent.displayName = `WithAuth(${Component.displayName || Component.name || 'Component'})`;
  return AuthComponent;
};
