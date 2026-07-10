"use client";

import { History } from "lucide-react";
import { theme } from "@/lib/theme";

export default function RecentActivity() {
  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <History
          size={24}
          color={theme.colors.primary}
        />

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Recent Activity
        </h2>
      </div>

      <p
        style={{
          margin: 0,
          color: theme.colors.textLight,
        }}
      >
        Department activity will appear here.
      </p>
    </div>
  );
}