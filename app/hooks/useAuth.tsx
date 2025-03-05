"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function getToken() {
      const savedToken = localStorage.getItem("auth_token");
      const savedUserId = localStorage.getItem("user_id");
      const savedTokenExpiry = localStorage.getItem("auth_token_expiry");

      // Check if token exists and is still valid
      if (savedToken && savedUserId && savedTokenExpiry) {
        const now = Date.now();
        if (now < parseInt(savedTokenExpiry, 10)) {
          setToken(savedToken);
          setUserId(savedUserId);
          return;
        }
      }

      // Request a new token if missing or expired
      try {
        const res = await fetch(`${API_URL}/generate-token`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to generate token");
        const data = await res.json();

        const newToken = data.token;
        const newUserId = data.user_id;
        const expiryTime = Date.now() + 12 * 60 * 60 * 1000; // 12 hours

        localStorage.setItem("auth_token", newToken);
        localStorage.setItem("user_id", newUserId);
        localStorage.setItem("auth_token_expiry", expiryTime.toString());

        setToken(newToken);
        setUserId(newUserId);
      } catch (err) {
        console.error("Token Error:", err);
        setError("Failed to generate authentication token");
      }
    }

    getToken();
  }, [API_URL]);

  return { token, userId, error };
}
