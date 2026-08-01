"use client";

import { useRouter } from "next/navigation";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import EventsInventory from "@/components/events/EventsInventory";

export default function EventsPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        title="Events"
        subtitle="Manage department meetings and events."
        onBack={() => router.push("/")}
      />

      <EventsInventory />
    </PageContainer>
  );
}