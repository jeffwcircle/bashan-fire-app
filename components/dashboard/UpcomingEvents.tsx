"use client";

import { CalendarDays } from "lucide-react";
import { theme } from "@/lib/theme";

const events = [
  {
    title: "No upcoming events",
    date: "Add events later",
  },
];

export default function UpcomingEvents() {
  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 24,
        height: 360,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          flexShrink: 0,
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

      <div
        style={{
          overflowY: "auto",
          flex: 1,
          paddingRight: 8,
        }}
      >
        {events.map((event, index) => (
          <div
            key={index}
            style={{
              padding: "10px 0",
              borderBottom:
                index === events.length - 1
                  ? "none"
                  : "1px solid #eee",
            }}
          >
            <div
              style={{
                fontWeight: 500,
              }}
            >
              {event.title}
            </div>

            <div
              style={{
                fontSize: 13,
                color: theme.colors.textLight,
                marginTop: 2,
              }}
            >
              {event.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}