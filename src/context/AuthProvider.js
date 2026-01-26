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
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            setLoading(true);
            if (authUser) {
                setUser(authUser);

                // Check if admin@mail.com - set as admin
                if (authUser.email === 'admin@mail.com') {
                    setRole('admin');
                    // Ensure admin role is saved in Firestore
                    try {
                        const userDocRef = doc(db, "users", authUser.uid);
                        const userDoc = await getDoc(userDocRef);
                        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                            // Set admin role in Firestore (this would normally be done server-side)
                            // For now, we'll just set it in state
                        }
                    } catch (error) {
                        console.error("Error setting admin role:", error);
                    }
                } else {
                    // Fetch Role from Token (Custom Claims)
                    try {
                        const tokenResult = await authUser.getIdTokenResult();
                        if (tokenResult.claims.role) {
                            setRole(tokenResult.claims.role);
                        } else {
                            // Fallback: Check Firestore if claims not set yet
                            const userDoc = await getDoc(doc(db, "users", authUser.uid));
                            if (userDoc.exists()) {
                                setRole(userDoc.data().role);
                            } else {
                                // Also check participants collection
                                const participantDoc = await getDoc(doc(db, "participants", authUser.uid));
                                if (participantDoc.exists()) {
                                    setRole(participantDoc.data().role || 'participant');
                                } else {
                                    setRole('participant'); // Default
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching role:", error);
                        setRole('participant'); // Default fallback
                    }
                }

            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            // Remove server session first
            await removeSession();
            // Then sign out from Firebase
            await firebaseSignOut(auth);
            // Clear local state
            setUser(null);
            setRole(null);
        } catch (error) {
            console.error('Sign out error:', error);
            // Even if there's an error, clear local state
            setUser(null);
            setRole(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
