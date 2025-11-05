"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChange, getCurrentUser } from "@/lib/firebase/auth";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (fbUser) => {
      try {
        setLoading(true);
        setError(null);

        if (fbUser) {
          setFirebaseUser(fbUser);
          const userData = await getCurrentUser(fbUser.uid);
          setUser(userData);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err: any) {
        console.error("Auth state change error:", err);
        setError(err.message || "Erro ao autenticar");
        setFirebaseUser(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
