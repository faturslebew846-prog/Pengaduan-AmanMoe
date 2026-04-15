'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from './firebase';
import { User, AuthContextType, UserRole } from './types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {

        setLoading(true);

        if (firebaseUser) {

          // sementara isi user dulu supaya UI tidak flicker
          setUser({
            uid: firebaseUser.uid,
            nama: '',
            email: firebaseUser.email || '',
            telp: '',
            role: 'siswa',
            createdAt: new Date(),
          });

          try {

            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {

              const data = userSnap.data();

              setUser({
                uid: firebaseUser.uid,
                nama: data.nama || '',
                email: data.email || firebaseUser.email || '',
                telp: data.telp || '',
                role: (data.role as UserRole) || 'siswa',
                createdAt: data.createdAt?.toDate?.() || new Date(),
              });

            }

          } catch (error) {

            console.error('Gagal mengambil profile user:', error);

          }

        } else {

          setUser(null);

        }

        setLoading(false);

      }
    );

    return () => unsubscribe();

  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;

}