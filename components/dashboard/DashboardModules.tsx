"use client";

import {
  Truck,
  Wrench,
  Package,
  BookOpen,
  Users,
  IceCreamCone,
  Settings,
} from "lucide-react";

import ModuleTile from "@/components/dashboard/ModuleTile";
import { theme } from "@/lib/theme";

export default function DashboardModules() {
  return (
    <div
      style={{
        maxWidth: "1600px",
        width: "100%",
        margin: "0 auto",
        padding: "0 6%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            FireHub Modules
          </h2>

          <div
            style={{
              color: theme.colors.textLight,
              marginTop: 6,
            }}
          >
            Select a module to begin.
          </div>
        </div>
      </div>

      <div
        className="module-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: 24,
        }}
      >
        <ModuleTile
          title="Truck Check"
          description="Monthly apparatus inspections"
          href="/truckcheck"
          permission="member"
          color={theme.colors.truck}
          icon={
            <Truck
              size={42}
              color={theme.colors.truck}
            />
          }
        />

        <ModuleTile
          title="Equipment"
          description="Equipment testing and inspections"
          href="/equipment"
          permission="member"
          color={theme.colors.equipment}
          icon={
            <Package
              size={42}
              color={theme.colors.equipment}
            />
          }
        />

        <ModuleTile
          title="Maintenance"
          description="Vehicle maintenance records"
          href="/maintenance"
          permission="member"
          color={theme.colors.maintenance}
          icon={
            <Wrench
              size={42}
              color={theme.colors.maintenance}
            />
          }
        />

        <ModuleTile
          title="Training"
          description="Department training records"
          href="/training"
          permission="member"
          color={theme.colors.training}
          icon={
            <BookOpen
              size={42}
              color={theme.colors.training}
            />
          }
        />

        <ModuleTile
          title="Firefighter Status"
          description="Personnel availability"
          href="/tracker"
          permission="member"
          color={theme.colors.status}
          icon={
            <Users
              size={42}
              color={theme.colors.status}
            />
          }
        />

        <ModuleTile
          title="Ice Cream Social"
          description="Fundraiser management"
          href="/icecreamsocial"
          permission="public"
          color="#ec4899"
          icon={
            <IceCreamCone
              size={42}
              color="#ec4899"
            />
          }
        />

        <ModuleTile
          title="Administration"
          description="Templates and settings"
          href="/admin"
          permission="admin"
          color={theme.colors.admin}
          icon={
            <Settings
              size={42}
              color={theme.colors.admin}
            />
          }
        />
      </div>
    </div>
  );
}