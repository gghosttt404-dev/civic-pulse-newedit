// Lightweight local "session" for current citizen profile id (no auth wired in this demo).
import { useEffect, useState } from "react";

const KEY = "nagrik_user_id";
const PROFILE_KEY = "nagrik_user_profile";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}
export function setUserId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, id);
}
export function setUserProfile(p: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}
export function getUserProfile(): any | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(PROFILE_KEY);
  return v ? JSON.parse(v) : null;
}

export function useUserProfile() {
  const [p, setP] = useState<any | null>(null);
  useEffect(() => { setP(getUserProfile()); }, []);
  return p;
}
