"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { CalendarDays } from "lucide-react";

import { db } from "@/lib/firebase";
import { theme } from "@/lib/theme";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "upcomingEvents"),
      orderBy("date"),
      orderBy("time")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<EventItem, "id">),
        }))
        .filter((event) => {
          if (!event.date) return false;

          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);

          return eventDate >= today;
        });

      setEvents(data);
    });

    return () => unsub();
  }, []);

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
        {events.length === 0 ? (
          <div
            style={{
              color: theme.colors.textLight,
            }}
          >
            No upcoming events.
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id}
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
                  fontWeight: 600,
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
                {event.time
                  ? ` • ${event.time}`
                  : ""}
              </div>

              {event.location && (
                <div
                  style={{
                    fontSize: 13,
                    color: theme.colors.textLight,
                    marginTop: 2,
                  }}
                >
                  📍 {event.location}
                </div>
              )}

              {event.description && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                  }}
                >
                  {event.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}