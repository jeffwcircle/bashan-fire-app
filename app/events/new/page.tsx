"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import EventForm, {
  EventFormValues,
} from "@/components/events/EventForm";

export default function NewEventPage() {
  const router = useRouter();

  const [saving, setSaving] =
    useState(false);

  async function saveEvent(
    values: EventFormValues
  ) {
    try {
      setSaving(true);

      await addDoc(
        collection(db, "upcomingEvents"),
        {
          ...values,
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
    <PageContainer>
      <PageHeader
        title="Add Event"
        subtitle="Create a new department event."
	backLabel="Events"
        onBack={() =>
          router.push("/events")
        }
      />

      <EventForm
        saving={saving}
        submitText="Save Event"
        onSubmit={saveEvent}
        onCancel={() =>
          router.push("/events")
        }
      />
    </PageContainer>
  );
}