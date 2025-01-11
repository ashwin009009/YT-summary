import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuthenticationStatus, useUserData } from '@nhost/react';
import { NhostClient } from '@nhost/nhost-js';

interface User {
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
}

// Use your existing Nhost client instance
const nhost = new NhostClient({
  subdomain: 'rqhbnhgtusbwbqghesfy',
  region: 'ap-south-1',
});

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { isAuthenticated } = useAuthenticationStatus();
  const nhostUser = useUserData();

  // Synchronize the `user` state with the Nhost authentication status
  useEffect(() => {
    if (isAuthenticated && nhostUser) {
      // Check if email is defined before using it
      const email = nhostUser.email ? nhostUser.email : "unknown"; // Fallback to "unknown" if email is undefined
  
      setUser({
        email: email, // Use the safely defined `email`
        username: nhostUser.displayName || nhostUser.email?.split('@')[0] || "Guest",
      });
    } else {
      setUser(null);
    }
  }, [isAuthenticated, nhostUser]);
  

  const login = useCallback(async (email: string, password: string) => {
    
    const currentSession = nhost.auth.getSession(); // Check if the user is already signed in
    if (currentSession) {
      console.log('User is already signed in');
      setUser({
        email: currentSession.user.email || "unknown",
        username: currentSession.user.displayName || (currentSession.user.email ? currentSession.user.email.split('@')[0] : "Guest"),
      });
      return; // Exit early if the user is already logged in
    }

    const response = await nhost.auth.signIn({ email, password });
    if (response.error) {
      throw new Error(response.error.message);
    }
    setUser({
      email: response.session?.user.email!,
      username: response.session?.user.displayName || email.split('@')[0],
    });
  }, []);

  const register = useCallback(async (email: string, password: string, username: string) => {

    const currentSession = nhost.auth.getSession(); // Check if the user is already signed in
    if (currentSession) {
      console.log('User is already signed in');
      setUser({
        email: currentSession.user.email || "unknown",
        username: currentSession.user.displayName || (currentSession.user.email ? currentSession.user.email.split('@')[0] : "Guest"),
      });
      return; // Exit early if the user is already logged in
    }

    const response = await nhost.auth.signUp({
      email,
      password,
      options: {
        displayName: username,
      },
    });
    if (response.error) {
      throw new Error(response.error.message);
    }
    setUser({
      email: response.session?.user.email!,
      username: response.session?.user.displayName || username,
    });
  }, []);

  const logout = useCallback(() => {
    nhost.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
