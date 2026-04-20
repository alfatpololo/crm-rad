'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { removeSession } from '@/actions/auth';

const AuthContext = createContext({
    user: null,
    role: null, // 'superadmin' | 'admin' | 'finance' | 'participant'
    loading: true,
    signOut: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); // Custom claim or firestore role
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let firstAuthEvent = true;
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (firstAuthEvent) setLoading(true);
            try {
                if (authUser) {
                    setUser(authUser);

                    if (authUser.email === 'admin@mail.com') {
                        setRole('admin');
                        try {
                            const userDocRef = doc(db, "users", authUser.uid);
                            const userDoc = await getDoc(userDocRef);
                            if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                                // admin role di Firestore biasanya dari server
                            }
                        } catch (error) {
                            console.error("Error setting admin role:", error);
                        }
                    } else {
                        try {
                            const tokenResult = await authUser.getIdTokenResult();
                            if (tokenResult.claims.role) {
                                setRole(tokenResult.claims.role);
                            } else {
                                const [userDoc, participantDoc] = await Promise.all([
                                    getDoc(doc(db, "users", authUser.uid)),
                                    getDoc(doc(db, "participants", authUser.uid)),
                                ]);
                                if (userDoc.exists()) {
                                    setRole(userDoc.data().role);
                                } else if (participantDoc.exists()) {
                                    setRole(participantDoc.data().role || 'participant');
                                } else {
                                    setRole('participant');
                                }
                            }
                        } catch (error) {
                            console.error("Error fetching role:", error);
                            setRole('participant');
                        }
                    }
                } else {
                    setUser(null);
                    setRole(null);
                }
            } finally {
                setLoading(false);
                firstAuthEvent = false;
            }
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await removeSession();
        } catch (error) {
            console.error('Sign out (session cookie):', error);
        }
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Sign out (Firebase):', error);
        }
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
