"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";

import EventForm, {
  EventFormValues,
} from "@/components/events/EventForm";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [initialValues, setInitialValues] =
    useState<EventFormValues>({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
    });

  useEffect(() => {
    async function loadEvent() {
      try {
        const snap = await getDoc(
          doc(db, "upcomingEvents", id)
        );

        if (!snap.exists()) {
          router.push("/events");
          return;
        }

        const data = snap.data();

        setInitialValues({
          title: data.title ?? "",
          date: data.date ?? "",
          time: data.time ?? "",
          location: data.location ?? "",
          description: data.description ?? "",
        });
      } catch (err) {
        console.error(err);
        alert("Unable to load event.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, router]);

  async function saveEvent(
    values: EventFormValues
  ) {
    try {
      setSaving(true);

      await updateDoc(
        doc(db, "upcomingEvents", id),
        {
          ...values,
        }
      );

      router.push(`/events/${id}`);
    } catch (err) {
      console.error(err);
      alert("Unable to save event.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Loading..."
          subtitle=""
          onBack={() =>
            router.push(`/events/${id}`)
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Edit Event"
        subtitle="Update department event information."
	backLabel="Event"
        onBack={() =>
          router.push(`/events/${id}`)
        }
      />

      <EventForm
        initialValues={initialValues}
        saving={saving}
        submitText="Save Changes"
        onSubmit={saveEvent}
        onCancel={() =>
          router.push(`/events/${id}`)
        }
      />
    </PageContainer>
  );
}