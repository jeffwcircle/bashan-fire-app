"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";

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
      <PageContainer>
        <PageHeader
          title="Loading..."
          subtitle=""
          onBack={() =>
            router.push("/events")
          }
        />
      </PageContainer>
    );
  }

  if (!event) return null;

  return (
    <PageContainer>
      <PageHeader
        title={event.title}
        subtitle="Department Event"
	backLabel="Events"
        onBack={() =>
          router.push("/events")
        }
      />

      <div
        style={{
          display: "grid",
          gap: 24,
          maxWidth: 800,
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

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 12,
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
        </div>
      </div>
    </PageContainer>
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
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div>
        {value || "-"}
      </div>
    </div>
  );
}