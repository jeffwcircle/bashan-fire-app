"use client";

import Image from "next/image";

import { theme } from "@/lib/theme";
import HeaderConditions from "@/components/dashboard/HeaderConditions";

interface Props {
  userName?: string;
}

export default function DashboardHeader({
  userName,
}: Props) {
  return (
    <div
      className="dashboard-header"
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 32,
        marginBottom: 28,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 32,
        alignItems: "center",
      }}
    >
      {/* LEFT */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Image
          src="/images/bashan-patch.png"
          alt="Bashan Patch"
          width={105}
          height={105}
          priority
        />

        <div>
          <div
            style={{
              color: theme.colors.textLight,
              fontSize: 18,
            }}
          >
            Welcome to
          </div>

          <h1
            style={{
              margin: "6px 0",
              fontSize: 40,
              fontWeight: 800,
              color: theme.colors.primary,
            }}
          >
            FireHub
          </h1>

          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            Bashan Volunteer Fire Department
          </div>

          <div
            style={{
              marginTop: 6,
              color: theme.colors.textLight,
            }}
          >
            Bashan, Ohio
          </div>

          <div
            style={{
              marginTop: 14,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            Welcome back, {userName}
          </div>
        </div>
      </div>

      {/* RIGHT */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: theme.colors.text,
          }}
        >
          Current Conditions
        </h3>

        <HeaderConditions />
      </div>
    </div>
  );
}