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
      email: "",
      password: "",
      role: "Member",
      active: true,
      is_firefighter: true,
    });

  useEffect(() => {
    loadMember();
  }, []);

  async function loadMember() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert("Unable to load member.");
      router.push("/admin/members");
      return;
    }

    setInitialValues({
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      email: "",
      password: "",
      role: data.role ?? "Member",
      active: data.active,
      is_firefighter: data.is_firefighter,
    });

    setLoading(false);
  }

  async function saveMember(
    values: MemberFormValues
  ) {
    try {
      setSaving(true);

      /*
       * Find the database role ID that corresponds
       * to the role selected in the form.
       */
      const {
        data: roleData,
        error: roleError,
      } = await supabase
        .from("roles")
        .select("id, name")
        .eq("name", values.role)
        .single();

      if (roleError || !roleData) {
        console.error(roleError);
        alert(
          `Unable to find the database role for "${values.role}".`
        );
        return;
      }

      /*
       * Update both the old role field and the new
       * role_id field while we are transitioning
       * the application to RBAC.
       */
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          role: values.role,
          role_id: roleData.id,
          active: values.active,
          is_firefighter: values.is_firefighter,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      router.push(`/admin/members/${id}`);
    } catch (err) {
      console.error(err);
      alert("Unable to save member.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        Loading member...
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Edit Member"
        subtitle="Update member information."
        backLabel="Member Details"
        onBack={() =>
          router.push(`/admin/members/${id}`)
        }
      />

      <MemberForm
        initialValues={initialValues}
        submitText="Save Changes"
        saving={saving}
        onSubmit={saveMember}
        onCancel={() =>
          router.push(`/admin/members/${id}`)
        }
      />
    </PageContainer>
  );
}