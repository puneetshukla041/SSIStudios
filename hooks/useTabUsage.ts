"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useTabUsage(pollInterval = 1) {
  const { user } = useAuth();
  const [seconds, setSeconds] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Increment timer only if tab is visible
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      if (isVisible) {
        setSeconds((prev) => prev + pollInterval);
        try {
          await fetch("/api/usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, seconds: pollInterval }),
          });
        } catch (err) {
          console.error("Failed to update usage:", err);
        }
      }
    }, pollInterval * 1000);

    return () => clearInterval(interval);
  }, [user, pollInterval, isVisible]);

  return formatTime(seconds);
}
