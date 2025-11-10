"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { usePathname } from "next/navigation";

interface UsageContextType {
  seconds: number;
  formattedTime: string;
}

const UsageContext = createContext<UsageContextType>({
  seconds: 0,
  formattedTime: "0s",
});

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [seconds, setSeconds] = useState(0);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  };

  // Load initial usage from DB
  useEffect(() => {
    if (!user) return;
    const fetchUsage = async () => {
      try {
        const res = await fetch(`/api/usage?userId=${user.id}`);
        const data = await res.json();
        if (data.success && data.usage) setSeconds(data.usage.seconds);
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      }
    };
    fetchUsage();
  }, [user]);

  // Increment timer only if user is on SSI tab AND tab is visible
  useEffect(() => {
    if (!user) return;
    if (!pathname.startsWith("/dashboard")) return; // Only SSI tab

    const tick = async () => {
      if (document.visibilityState === "visible") {
        setSeconds((prev) => prev + 1);
        try {
          await fetch("/api/usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, seconds: 1 }),
          });
        } catch (err) {
          console.error("Failed to update usage:", err);
        }
      }
    };

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [user, pathname]);

  return (
    <UsageContext.Provider value={{ seconds, formattedTime: formatTime(seconds) }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = () => useContext(UsageContext);
