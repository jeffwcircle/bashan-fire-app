"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  active: boolean;
  is_firefighter: boolean;
}

export default function MembersInventory() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, role, active, is_firefighter"
      )
      .order("last_name")
      .order("first_name");

    if (error) {
      console.error(error);
    } else {
      setMembers(data ?? []);
    }

    setLoading(false);
  }

  const filtered = useMemo(() => {
    const text = search.toLowerCase();

    return members.filter((m) => {
      const fullName =
        `${m.first_name} ${m.last_name}`.toLowerCase();

      return (
        fullName.includes(text) ||
        m.role.toLowerCase().includes(text)
      );
    });
  }, [members, search]);

  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <input
          placeholder="Search members..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            flex: 1,
            minWidth: 250,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <button
          className="btn btn-success"
          onClick={() =>
            router.push("/admin/members/new")
          }
        >
          ➕ Add Member
        </button>
      </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px,1fr))",
    gap: 16,
    marginBottom: 24,
  }}
>
  <SummaryCard
    title="Members"
    value={members.length}
    color="#991b1b"
  />

  <SummaryCard
    title="Active"
    value={
      members.filter((m) => m.active).length
    }
    color="#16a34a"
  />

  <SummaryCard
    title="Firefighters"
    value={
      members.filter(
        (m) => m.is_firefighter
      ).length
    }
    color="#2563eb"
  />

  <SummaryCard
    title="Non-Firefighters"
    value={
      members.filter(
        (m) => !m.is_firefighter
      ).length
    }
    color="#6b7280"
  />
</div>

      <div
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        {filtered.map((member) => (
          <div
            key={member.id}
            className="card shadow-hover"
            onClick={() =>
              router.push(
                `/admin/members/${member.id}`
              )
            }
            style={{
              cursor: "pointer",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {member.first_name}{" "}
                  {member.last_name}
                </div>

                <div
                  style={{
                    color: "#666",
                    marginTop: 4,
                  }}
                >
                  {member.role}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Badge
                  color={
                    member.active
                      ? "#16a34a"
                      : "#dc2626"
                  }
                >
                  {member.active
                    ? "🟢 Active"
                    : "🔴 Inactive"}
                </Badge>

                <Badge
                  color={
                    member.is_firefighter
                      ? "#2563eb"
                      : "#6b7280"
                  }
                >
                  {member.is_firefighter
                    ? "🚒 Firefighter"
                    : "👥 Non-Firefighter"}
                </Badge>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#666",
              padding: 40,
            }}
          >
            No members found.
          </div>
        )}
      </div>
    </>
  );
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span
      style={{
        background: color,
        color: "white",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}
