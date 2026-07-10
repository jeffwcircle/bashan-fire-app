"use client";

import { CalendarDays } from "lucide-react";
import { theme } from "@/lib/theme";

export default function UpcomingEvents() {
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
        <CalendarDays
          size={24}
          color={theme.colors.primary}
        />

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Upcoming Events
        </h2>
      </div>

      <p
        style={{
          margin: 0,
          color: theme.colors.textLight,
        }}
      >
        Upcoming department events will appear here.
      </p>
    </div>
  );
}