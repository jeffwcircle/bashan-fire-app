"use client";

import { useRouter } from "next/navigation";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import MembersInventory from "@/components/admin/MembersInventory";

export default function MembersPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        title="Members"
        subtitle="Manage FireHub members and user accounts."
        backLabel="Administration"
        onBack={() => router.push("/admin")}
      />

      <MembersInventory />
    </PageContainer>
  );
}