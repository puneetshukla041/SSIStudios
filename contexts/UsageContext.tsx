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

  const formatTime = (totalSeconds: number) => {
    // Round down for display to avoid flickering decimals
    const sec = Math.floor(totalSeconds);
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
    if (sec < 86400)
      return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
    return `${Math.floor(sec / 86400)}d ${Math.floor((sec % 86400) / 3600)}h`;
  };

  // Load initial usage from DB (Minutes) and convert to Seconds
  useEffect(() => {
    if (!user) return;
    const fetchUsage = async () => {
      try {
        const res = await fetch(`/api/usage?userId=${user.id}`);
        const data = await res.json();
        
        if (data.success && data.usage) {
          // If DB has minutes, convert to seconds for local state
          // Fallback to 0 if new user
          const minutesFromDB = data.usage.minutes || 0;
          setSeconds(minutesFromDB * 60);
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      }
    };
    fetchUsage();
  }, [user]);

  // Increment timer only if user is on Dashboard AND tab is visible
  useEffect(() => {
    if (!user) return;
    // Check if path starts with /dashboard (or is the specific SSI tab logic you prefer)
    if (!pathname.startsWith("/dashboard")) return; 

    const tick = async () => {
      if (document.visibilityState === "visible") {
        // Update local UI immediately
        setSeconds((prev) => prev + 1);

        // Update DB
        try {
          await fetch("/api/usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // We still send 1 second increments. The API handles the conversion to minutes.
            body: JSON.stringify({ userId: user.id, seconds: 1 }),
          });
        } catch (err) {
          console.error("Failed to update usage:", err);
        }
      }
    };

    // Run every 1 second
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [user, pathname]);

  return (
    <UsageContext.Provider value={{ seconds, formattedTime: formatTime(seconds) }}>
      {children}
    </UsageContext.Provider>
  );
};

// Export the hook for consuming the context
export const useUsage = () => useContext(UsageContext);