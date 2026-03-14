import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuthToken(): string | null {
  return localStorage.getItem("beer_admin_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("beer_admin_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("beer_admin_token");
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
