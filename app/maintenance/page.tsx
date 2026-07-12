"use client";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import MaintenanceInventory from "@/components/maintenance/MaintenanceInventory";
import { useRouter } from "next/navigation";

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        title="Maintenance"
        subtitle="Manage scheduled maintenance for department equipment."
        onBack={() => router.push("/")}
      />

      <MaintenanceInventory />
    </PageContainer>
  );
}