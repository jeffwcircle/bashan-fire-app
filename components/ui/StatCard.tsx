"use client";

import { ReactNode } from "react";
import { theme } from "@/lib/theme";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 72,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,.08)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1,
          }}
        >
          {value}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: theme.colors.textLight,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}