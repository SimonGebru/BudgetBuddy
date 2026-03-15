import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, isAuthenticated, logout } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        // Om det inte finns någon giltig auth-status lokalt
        // behöver vi inte försöka hämta användaren från backend.
        if (!isAuthenticated()) {
          setUser(null);
          return;
        }

        // Hämtar inloggad användare när appen startar
        // så att auth-state kan återskapas vid refresh.
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Om något går fel rensas auth-data för att undvika
        // att appen ligger kvar i ett ogiltigt inloggat läge.
        await logout();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated: !!user,
      isAuthLoading,

      // Samlad funktion för att logga ut och samtidigt nollställa state i contextet.
      clearAuth: async () => {
        await logout();
        setUser(null);
      },
    }),
    [user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  // Säkerhet så att hooken inte används utanför rätt provider.
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}