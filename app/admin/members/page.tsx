"use client";

import { useRouter } from "next/navigation";

import RequirePermission from "@/components/auth/RequirePermission";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import MembersInventory from "@/components/admin/MembersInventory";

export default function MembersPage() {
  const router = useRouter();

  return (
    <RequirePermission permission="members">
    <PageContainer>
      <PageHeader
        title="Members"
        subtitle="Manage FireHub members and user accounts."
        backLabel="Administration"
        onBack={() => router.push("/admin")}
      />

      <MembersInventory />
    </PageContainer>
    </RequirePermission>
  );
}