"use client";

import {
  Truck,
  ClipboardList,
  Users,
  AlertTriangle,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

export default function DashboardStats() {
  return (
    <>
      <h2
        style={{
          marginBottom: 20,
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        Department Overview
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <StatCard
          title="Apparatus"
          value={12}
          icon={<Truck color="#dc2626" size={34} />}
        />

        <StatCard
          title="Open Logs"
          value={37}
          icon={<ClipboardList color="#2563eb" size={34} />}
        />

        <StatCard
          title="Firefighters"
          value={26}
          icon={<Users color="#16a34a" size={34} />}
        />

        <StatCard
          title="Open Issues"
          value={3}
          icon={<AlertTriangle color="#ea580c" size={34} />}
        />
      </div>
    </>
  );
}