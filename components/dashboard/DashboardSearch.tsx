"use client";

import { Search } from "lucide-react";
import { theme } from "@/lib/theme";

export default function DashboardSearch() {
  return (
    <div
      style={{
        marginBottom: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "white",
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadow.card,
          padding: "14px 18px",
          gap: 12,
        }}
      >
        <Search size={20} color={theme.colors.textLight} />

        <input
          placeholder="Search FireHub..."
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            fontSize: 16,
          }}
        />
      </div>
    </div>
  );
}