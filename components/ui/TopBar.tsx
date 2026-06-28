"use client";

import { CalendarDays, Bell, ChevronDown, LogOut } from "lucide-react";

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
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: "18px 24px",
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#6b7280",
        }}
      >
        <CalendarDays size={18} />
        {today}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <Bell
          size={20}
          color="#6b7280"
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {userName}

          <ChevronDown size={18} />
        </div>

        <button
          className="btn btn-secondary"
          onClick={onLogout}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}