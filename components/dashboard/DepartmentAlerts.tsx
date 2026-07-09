"use client";

import { AlertTriangle } from "lucide-react";
import { theme } from "@/lib/theme";

interface AlertItem {
  color: string;
  title: string;
}

const alerts: AlertItem[] = [
  {
    color: "#dc2626",
    title: "Engine 73 annual maintenance overdue",
  },
  {
    color: "#f59e0b",
    title: "Truck 74 truck check due in 3 days",
  },
  {
    color: "#2563eb",
    title: "Monthly equipment inspections due this week",
  },
  {
    color: "#16a34a",
    title: "July training completed by 18 of 22 members",
  },
];

export default function DepartmentAlerts() {
  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 24,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <AlertTriangle color="#dc2626" size={24} />

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Department Alerts
        </h2>
      </div>

      {alerts.map((alert, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 0",
            borderBottom:
              index === alerts.length - 1
                ? "none"
                : "1px solid #eee",
          }}
        >
          <div
            style={{
              width: 6,
              alignSelf: "stretch",
              background: alert.color,
              borderRadius: 999,
            }}
          />

          <div
            style={{
              fontSize: 16,
              color: theme.colors.text,
            }}
          >
            {alert.title}
          </div>
        </div>
      ))}
    </div>
  );
}