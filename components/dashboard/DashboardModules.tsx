"use client";

import {
  Truck,
  Wrench,
  Package,
  BookOpen,
  Users,
  IceCreamBowl,
  Settings,
} from "lucide-react";

import ModuleCard from "@/components/ui/ModuleCard";
import { theme } from "@/lib/theme";

export default function DashboardModules() {
  return (
    <>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: 24,
        }}
      >
        <ModuleCard
          title="Truck Check"
          description="Monthly apparatus inspections"
          href="/truckcheck"
          color={theme.colors.truck}
          icon={<Truck size={42} color={theme.colors.truck} />}
        />

        <ModuleCard
          title="Equipment"
          description="Equipment testing and inspections"
          href="/equipment"
          color={theme.colors.equipment}
          icon={<Package size={42} color={theme.colors.equipment} />}
        />

        <ModuleCard
          title="Maintenance"
          description="Vehicle maintenance records"
          href="/maintenance"
          color={theme.colors.maintenance}
          icon={<Wrench size={42} color={theme.colors.maintenance} />}
        />

        <ModuleCard
          title="Training"
          description="Department training records"
          href="/training"
          color={theme.colors.training}
          icon={<BookOpen size={42} color={theme.colors.training} />}
        />

        <ModuleCard
          title="Firefighter Status"
          description="Personnel availability"
          href="/tracker"
          color={theme.colors.status}
          icon={<Users size={42} color={theme.colors.status} />}
        />

        <ModuleCard
          title="Ice Cream Social"
          description="Fundraiser management"
          href="/icecreamsocial"
          color="#ec4899"
          icon={<IceCreamBowl size={42} color="#ec4899" />}
        />

        <ModuleCard
          title="Administration"
          description="Templates and settings"
          href="/admin"
          color={theme.colors.admin}
          icon={<Settings size={42} color={theme.colors.admin} />}
        />
      </div>
    </>
  );
}