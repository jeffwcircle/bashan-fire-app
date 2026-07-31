"use client";

import EventsInventory from "@/components/events/EventsInventory";

export default function EventsPage() {
  return (
    <main
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1
        style={{
          marginTop: 0,
          marginBottom: 24,
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        Department Events
      </h1>

      <EventsInventory />
    </main>
  );
}