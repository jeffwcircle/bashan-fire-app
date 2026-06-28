"use client";

import Image from "next/image";
import {
  Truck,
  ClipboardList,
  Users,
  AlertTriangle,
} from "lucide-react";

import { theme } from "@/lib/theme";
import StatCard from "@/components/ui/StatCard";

interface Props {
  userName?: string;
}

export default function DashboardHeader({
  userName = "Jeff Circle",
}: Props) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 32,
        marginBottom: 28,
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 32,
        alignItems: "center",
      }}
    >
      {/* Left Side */}

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
              margin: "4px 0",
              fontSize: 38,
              fontWeight: 800,
              color: theme.colors.text,
            }}
          >
            {userName}
          </h1>

          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Bashan
            <span
              style={{
                color: theme.colors.primary,
              }}
            >
              {" "}
              FireHub
            </span>
          </div>

          <div
            style={{
              marginTop: 6,
              color: theme.colors.textLight,
            }}
          >
            Bashan Volunteer Fire Department
          </div>

          <div
            style={{
              color: theme.colors.textLight,
            }}
          >
            Bashan, Ohio
          </div>
        </div>
      </div>

      {/* Right Side */}

      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Department Overview
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <StatCard
            title="Apparatus"
            value={12}
            icon={
              <Truck
                size={24}
                color={theme.colors.truck}
              />
            }
          />

          <StatCard
            title="Open Logs"
            value={37}
            icon={
              <ClipboardList
                size={24}
                color={theme.colors.maintenance}
              />
            }
          />

          <StatCard
            title="Members"
            value={26}
            icon={
              <Users
                size={24}
                color={theme.colors.training}
              />
            }
          />

          <StatCard
            title="Issues"
            value={3}
            icon={
              <AlertTriangle
                size={24}
                color={theme.colors.equipment}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}