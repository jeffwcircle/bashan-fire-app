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
      className="dashboard-header"
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 32,
        marginBottom: 28,
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

      <div>
        <h3
          style={{
            marginTop: 0,
            marginBottom: 16,
          }}
        >
          Department Overview
        </h3>

        <div className="dashboard-stats">
          <StatCard
            title="Apparatus"
            value={12}
            icon={
              <Truck
                size={22}
                color={theme.colors.truck}
              />
            }
          />

          <StatCard
            title="Logs"
            value={37}
            icon={
              <ClipboardList
                size={22}
                color={theme.colors.maintenance}
              />
            }
          />

          <StatCard
            title="Members"
            value={26}
            icon={
              <Users
                size={22}
                color={theme.colors.training}
              />
            }
          />

          <StatCard
            title="Issues"
            value={3}
            icon={
              <AlertTriangle
                size={22}
                color={theme.colors.equipment}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}