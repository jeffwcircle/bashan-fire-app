"use client";

import { useRouter } from "next/navigation";

import RequirePermission from "@/components/auth/RequirePermission";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import MaintenanceInventory from "@/components/maintenance/MaintenanceInventory";

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <RequirePermission permission="maintenance">
      <PageContainer>
        <PageHeader
          title="Maintenance"
          subtitle="Manage scheduled maintenance for department equipment."
          onBack={() => router.push("/")}
        />

        <MaintenanceInventory />
      </PageContainer>
    </RequirePermission>
  );
}