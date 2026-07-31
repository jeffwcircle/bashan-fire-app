"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface EventItem {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

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

        const data = snap.data() as EventItem;

        setTitle(data.title ?? "");
        setDate(data.date ?? "");
        setTime(data.time ?? "");
        setLocation(data.location ?? "");
        setDescription(data.description ?? "");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  async function save(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!date) {
      alert("Please choose a date.");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(
        doc(db, "upcomingEvents", id),
        {
          title,
          date,
          time,
          location,
          description,
        }
      );

      router.push(`/events/${id}`);
    } catch (err) {
      console.error(err);
      alert("Unable to save changes.");
    } finally {
      setSaving(false);
    }
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

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1>Edit Event</h1>

      <form
        onSubmit={save}
        style={{
          display: "grid",
          gap: 20,
        }}
      >
        <div>
          <label>Title</label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Time</label>

          <input
            type="time"
            value={time}
            onChange={(e) =>
              setTime(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Location</label>

          <input
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(`/events/${id}`)
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "16px",
} as const;