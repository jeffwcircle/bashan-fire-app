"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface EventItem {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt?: any;
}

export default function EventsInventory() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [showPast, setShowPast] =
    useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "upcomingEvents"),
      orderBy("date"),
      orderBy("time")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as EventItem),
      }));

      setEvents(
        showPast
          ? data
          : data.filter((event) => {
              const eventDate = new Date(
                event.date
              );
              eventDate.setHours(
                0,
                0,
                0,
                0
              );

              return eventDate >= today;
            })
      );
    });

    return () => unsub();
  }, [showPast]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <button
          className="btn btn-success"
          onClick={() =>
            router.push("/events/new")
          }
        >
          ➕ Add Event
        </button>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) =>
              setShowPast(
                e.target.checked
              )
            }
          />

          Show Past Events
        </label>
      </div>

      {events.length === 0 ? (
        <div className="card">
          No events found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="card"
              style={{
                cursor: "pointer",
              }}
              onClick={() =>
                router.push(
                  `/events/${event.id}`
                )
              }
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {event.title}
              </div>

              <div
                style={{
                  marginTop: 8,
                  color: "#6b7280",
                }}
              >
                📅 {event.date}
                {event.time &&
                  ` • ${event.time}`}
              </div>

              {event.location && (
                <div
                  style={{
                    marginTop: 4,
                  }}
                >
                  📍 {event.location}
                </div>
              )}

              {event.description && (
                <div
                  style={{
                    marginTop: 12,
                  }}
                >
                  {event.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}