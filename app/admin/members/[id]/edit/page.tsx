
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";

import MemberForm, {
  MemberFormValues,
} from "@/components/admin/MemberForm";

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [initialValues, setInitialValues] =
    useState<MemberFormValues>({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      role: "Member",
      active: true,
      is_firefighter: true,
    });

  useEffect(() => {
    loadMember();
  }, [id]);

  async function loadMember() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Unable to load member:", error);
      alert("Unable to load member.");
      router.push("/admin/members");
      return;
    }

    setInitialValues({
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      username: data.username ?? "",
      email: "",
      password: "",
      role: data.role ?? "Member",
      active: data.active ?? true,
      is_firefighter: data.is_firefighter ?? false,
    });

    setLoading(false);
  }

  async function saveMember(values: MemberFormValues) {
    try {
      setSaving(true);

      // Find the database role ID for the selected role.
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id, name")
        .eq("name", values.role)
        .single();

      if (roleError || !roleData) {
        console.error("Role lookup failed:", roleError);
        alert(`Unable to find the database role for "${values.role}".`);
        return;
      }

      // Update the member's profile and role assignment.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          role: roleData.name,
          role_id: roleData.id,
          active: values.active,
          is_firefighter: values.is_firefighter,
        })
        .eq("id", id);

      if (profileError) {
        throw profileError;
      }

      // Change the Auth password only if a new one was entered.
      if (values.password.trim()) {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          alert(
            "Your session has expired. Please sign in again. The profile changes may already have been saved."
          );
          router.push("/login");
          return;
        }

        const passwordResponse = await fetch(
          "/api/admin/update-user-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              userId: id,
              password: values.password,
            }),
          }
        );

        const passwordResult = await passwordResponse.json();

        if (!passwordResponse.ok) {
          alert(
            `Profile changes were saved, but the password was not changed: ${
              passwordResult.error || "Unknown error."
            }`
          );
          return;
        }
      }

      alert(
        values.password.trim()
          ? "Member details and password updated successfully."
          : "Member details updated successfully."
      );

      router.push(`/admin/members/${id}`);
      router.refresh();
    } catch (err) {
      console.error("Unable to save member:", err);
      alert("Unable to save member details.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageContainer>Loading member...</PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Edit Member"
        subtitle="Update member information and optionally reset their password."
        backLabel="Member Details"
        onBack={() => router.push(`/admin/members/${id}`)}
      />

      <MemberForm
        initialValues={initialValues}
        submitText="Save Changes"
        saving={saving}
        onSubmit={saveMember}
        onCancel={() => router.push(`/admin/members/${id}`)}
      />
    </PageContainer>
  );
}
