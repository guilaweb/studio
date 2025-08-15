

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '@/lib/data';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setProfile(doc.data() as UserProfile);
            } else {
                // This could happen for users who existed before the profiles collection was created
                setProfile({
                    uid: user.uid,
                    displayName: user.displayName || 'Utilizador Anónimo',
                    email: user.email || '',
                    role: 'Cidadão',
                });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setProfile(null);
            setLoading(false);
        });

        return () => unsubscribeProfile();
    }
  }, [user]);


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

    useEffect(() => {
      if (loading) return; // Wait for loading to complete

      if (!user) {
        router.push('/login');
        return;
      }
      
      if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // If roles are specified and the user's role is not one of them, redirect
        toast({
            variant: "destructive",
            title: "Acesso Negado",
            description: "Não tem permissão para aceder a esta página.",
        })
        router.push('/');
      }

    }, [user, profile, loading, router]);

    if (loading || !user || (allowedRoles && (!profile || !allowedRoles.includes(profile.role)))) {
      return <div>A carregar...</div>; // Or a proper loader
    }

    return <Component {...props} />;
  };
  AuthComponent.displayName = `WithAuth(${Component.displayName || Component.name || 'Component'})`;
  return AuthComponent;
};
function toast(arg0: { variant: "destructive"; title: string; description: string; }) {
    throw new Error('Function not implemented.');
}

