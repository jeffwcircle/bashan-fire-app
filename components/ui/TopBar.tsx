"use client";

import { Bell, CalendarDays, LogOut } from "lucide-react";
import { theme } from "@/lib/theme";

interface Props {
  userName?: string;
  onLogout?: () => void;
}

export default function TopBar({
  userName = "Loading...",
  onLogout,
}: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: "18px 24px",
        marginBottom: 24,
        boxShadow: theme.shadow.card,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          Welcome to FireHub
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: theme.colors.textLight,
            marginTop: 6,
          }}
        >
          <CalendarDays size={16} />
          {today}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Bell
          size={20}
          color={theme.colors.textLight}
        />

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: theme.colors.text,
            }}
          >
            {userName}
          </div>

          <div
            style={{
              fontSize: 12,
              color: theme.colors.textLight,
            }}
          >
            Logged In
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            border: "none",
            background: theme.colors.primary,
            color: "white",
            borderRadius: theme.radius.md,
            padding: "10px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}