"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import ResetPasswordDialog from "@/components/admin/ResetPasswordDialog";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: string;
  active: boolean;
  is_firefighter: boolean;
}

export default function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const [showResetPassword, setShowResetPassword] =
    useState(false);

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
    } else {
      setMember(data);
    }

    setLoading(false);
  }

  async function toggleMember() {
    if (!member) return;

    const action = member.active
      ? "deactivate"
      : "reactivate";

    const confirmed = confirm(
      `Are you sure you want to ${action} ${member.first_name} ${member.last_name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/admin/toggle-member",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: member.id,
            active: !member.active,
            is_firefighter:
              member.is_firefighter,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.error);
        return;
      }

      await loadMember();

      alert(
        `Member ${
          member.active
            ? "deactivated"
            : "reactivated"
        }.`
      );
    } catch (err) {
      console.error(err);
      alert("Unable to update member.");
    }
  }

  if (loading) {
    return (
      <PageContainer>
        Loading member...
      </PageContainer>
    );
  }

  if (!member) {
    return (
      <PageContainer>
        Member not found.
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`${member.first_name} ${member.last_name}`}
        subtitle="Member Details"
        backLabel="Members"
        onBack={() =>
          router.push("/admin/members")
        }
      />

      <div
        className="card"
        style={{ padding: 24 }}
      >
        <Detail
          label="First Name"
          value={member.first_name}
        />

        <Detail
          label="Last Name"
          value={member.last_name}
        />

        <Detail
          label="Role"
          value={member.role}
        />

        <Detail
          label="Status"
          value={
            member.active
              ? "🟢 Active"
              : "🔴 Inactive"
          }
        />

        <Detail
          label="Firefighter"
          value={
            member.is_firefighter
              ? "🚒 Yes"
              : "👥 No"
          }
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() =>
            router.push(
              `/admin/members/${id}/edit`
            )
          }
        >
          ✏️ Edit Member
        </button>

        <button
          className="btn btn-secondary"
          onClick={() =>
            setShowResetPassword(true)
          }
        >
          🔑 Reset Password
        </button>

        <button
          className={
            member.active
              ? "btn btn-danger"
              : "btn btn-success"
          }
          onClick={toggleMember}
        >
          {member.active
            ? "🔴 Deactivate Member"
            : "🟢 Reactivate Member"}
        </button>
      </div>

      <ResetPasswordDialog
        open={showResetPassword}
        memberId={member.id}
        memberName={`${member.first_name} ${member.last_name}`}
        onClose={() =>
          setShowResetPassword(false)
        }
      />
    </PageContainer>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}