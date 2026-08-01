"use client";

import { useState, useEffect } from "react";

export interface EventFormValues {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

interface Props {
  initialValues?: EventFormValues;
  saving?: boolean;
  submitText?: string;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onCancel: () => void;
}

const emptyValues: EventFormValues = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
};

export default function EventForm({
  initialValues = emptyValues,
  saving = false,
  submitText = "Save",
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] =
    useState<EventFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function update<K extends keyof EventFormValues>(
    field: K,
    value: EventFormValues[K]
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!values.title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!values.date) {
      alert("Please select a date.");
      return;
    }

    await onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 700,
        display: "grid",
        gap: 20,
      }}
    >
      <div>
        <label>Title</label>

        <input
          value={values.title}
          onChange={(e) =>
            update("title", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label>Date</label>

        <input
          type="date"
          value={values.date}
          onChange={(e) =>
            update("date", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label>Time</label>

        <input
          type="time"
          value={values.time}
          onChange={(e) =>
            update("time", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label>Location</label>

        <input
          value={values.location}
          onChange={(e) =>
            update("location", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label>Description</label>

        <textarea
          rows={5}
          value={values.description}
          onChange={(e) =>
            update(
              "description",
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
            : submitText}
        </button>

        <button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
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