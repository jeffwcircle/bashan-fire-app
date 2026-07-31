"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface EventItem {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const router = useRouter();

  const [event, setEvent] =
    useState<EventItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(
          doc(db, "upcomingEvents", id)
        );

        if (!snap.exists()) {
          router.push("/events");
          return;
        }

        setEvent(
          snap.data() as EventItem
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  async function deleteEvent() {
    if (
      !confirm(
        "Delete this event?"
      )
    )
      return;

    await deleteDoc(
      doc(db, "upcomingEvents", id)
    );

    router.push("/events");
  }

  if (loading) {
    return (
      <main
        style={{
          padding: 24,
        }}
      >
        Loading...
      </main>
    );
  }

  if (!event) return null;

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1
        style={{
          marginTop: 0,
        }}
      >
        {event.title}
      </h1>

      <div
        style={{
          display: "grid",
          gap: 20,
          marginTop: 30,
        }}
      >
        <Info
          label="Date"
          value={event.date}
        />

        <Info
          label="Time"
          value={event.time}
        />

        <Info
          label="Location"
          value={event.location}
        />

        <Info
          label="Description"
          value={event.description}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 40,
        }}
      >
        <button
          onClick={() =>
            router.push(
              `/events/${id}/edit`
            )
          }
        >
          ✏️ Edit Event
        </button>

        <button
          onClick={deleteEvent}
          style={{
            background: "#dc2626",
            color: "white",
          }}
        >
          🗑 Delete Event
        </button>

        <button
          onClick={() =>
            router.push("/events")
          }
        >
          ← Back
        </button>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div>{value || "-"}</div>
    </div>
  );
}