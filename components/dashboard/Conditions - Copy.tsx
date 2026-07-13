"use client";

import { CloudSun } from "lucide-react";
import { theme } from "@/lib/theme";

export default function Conditions() {
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
        <CloudSun
          size={24}
          color="#f59e0b"
        />

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Conditions
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div>
          🌤 Weather information coming soon...
        </div>

        <div>
          🔥 Fire Danger: --
        </div>

        <div>
          🚫 Burn Ban: --
        </div>
      </div>
    </div>
  );
}