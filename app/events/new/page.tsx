"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function NewEventPage() {
  const router = useRouter();

  const [saving, setSaving] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [description, setDescription] =
    useState("");

  async function saveEvent(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(
        collection(db, "upcomingEvents"),
        {
          title,
          date,
          time,
          location,
          description,
          createdAt: Timestamp.now(),
        }
      );

      router.push("/events");
    } catch (err) {
      console.error(err);
      alert("Unable to save event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1
        style={{
          marginTop: 0,
          marginBottom: 24,
        }}
      >
        Add Event
      </h1>

      <form
        onSubmit={saveEvent}
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
              : "Save Event"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/events")
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
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "16px",
} as const;