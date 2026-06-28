import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function formatScore(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-400" };
  if (score >= 70) return { label: "Good", color: "text-blue-400" };
  if (score >= 50) return { label: "Fair", color: "text-amber-400" };
  if (score >= 30) return { label: "Low", color: "text-orange-400" };
  return { label: "Poor", color: "text-red-400" };
}
