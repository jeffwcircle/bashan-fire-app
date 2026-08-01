"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";

import MemberForm, {
  MemberFormValues,
} from "@/components/admin/MemberForm";

export default function NewMemberPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  async function createMember(
    values: MemberFormValues
  ) {
    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/create-user",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.error);
        return;
      }

      alert("Member created successfully.");

      router.push("/admin/members");
    } catch (err) {
      console.error(err);

      alert(
        "Unable to create member."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Add Member"
        subtitle="Create a new FireHub member."
        backLabel="Members"
        onBack={() =>
          router.push("/admin/members")
        }
      />

      <MemberForm
        submitText="Create Member"
        saving={saving}
        onSubmit={createMember}
        onCancel={() =>
          router.push("/admin/members")
        }
      />
    </PageContainer>
  );
}