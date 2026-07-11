"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "oklch(0.172 0.009 266.38)",
          color: "oklch(0.985 0 0)",
          border: "1px solid oklch(1 0 0 / 0.08)",
          borderRadius: "0.75rem",
          fontSize: "0.8125rem",
          padding: "12px 16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "oklch(0.985 0 0)",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "oklch(0.985 0 0)",
          },
        },
      }}
    />
  );
}
