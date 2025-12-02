"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CrashContextType {
  isCrashed: boolean;
  toggleCrash: () => Promise<void>;
  isLoading: boolean;
}

const CrashContext = createContext<CrashContextType | undefined>(undefined);

export function CrashProvider({ children }: { children: ReactNode }) {
  const [isCrashed, setIsCrashed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check API status on initial load
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const res = await fetch('/api/admin/crash');
        const data = await res.json();
        setIsCrashed(data.crashed);
      } catch (error) {
        console.error("Failed to check system status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSystemStatus();
  }, []);

  // 2. Function to toggle crash state via API
  const toggleCrash = async () => {
    const newState = !isCrashed;
    
    // Optimistic UI update
    setIsCrashed(newState);

    try {
      await fetch('/api/admin/crash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crashed: newState }),
      });
    } catch (error) {
      console.error("Failed to update crash state:", error);
      // Revert if failed
      setIsCrashed(!newState);
    }
  };

  return (
    <CrashContext.Provider value={{ isCrashed, toggleCrash, isLoading }}>
      {children}
    </CrashContext.Provider>
  );
}

export function useCrash() {
  const context = useContext(CrashContext);
  if (context === undefined) {
    throw new Error('useCrash must be used within a CrashProvider');
  }
  return context;
}