"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { AlertTriangle } from "lucide-react";

import { db } from "@/lib/firebase";
import { Equipment } from "@/lib/types/equipment";
import { MaintenanceItem } from "@/components/maintenance/MaintenanceInventory";
import { theme } from "@/lib/theme";

interface AlertItem {
  color: string;
  title: string;
}

export default function DepartmentAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    let equipment: Equipment[] = [];
    let maintenance: MaintenanceItem[] = [];

    function buildAlerts() {
      const results: AlertItem[] = [];

      equipment.forEach((item) => {
        if (
          item.status === "Retired" ||
          !item.nextDueDate
        )
          return;

        const due =
          item.nextDueDate instanceof Timestamp
            ? item.nextDueDate.toDate()
            : item.nextDueDate.toDate();

        const days = Math.ceil(
          (due.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );

        if (days < 0) {
          results.push({
            color: "#dc2626",
            title: `🚒 ${item.name} inspection OVERDUE`,
          });
        } else if (days <= 7) {
          results.push({
            color: "#f59e0b",
            title: `🚒 ${item.name} inspection due in ${days} day${days === 1 ? "" : "s"}`,
          });
        }
      });

      maintenance.forEach((item) => {
        if (
          item.status === "Retired" ||
          !item.nextDueDate
        )
          return;

        const due =
          item.nextDueDate instanceof Timestamp
            ? item.nextDueDate.toDate()
            : item.nextDueDate.toDate();

        const days = Math.ceil(
          (due.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );

        if (days < 0) {
          results.push({
            color: "#dc2626",
            title: `🔧 ${item.name} maintenance OVERDUE`,
          });
        } else if (days <= 7) {
          results.push({
            color: "#f59e0b",
            title: `🔧 ${item.name} maintenance due in ${days} day${days === 1 ? "" : "s"}`,
          });
        }
      });

      results.sort((a, b) => {
        if (a.color === b.color) return 0;
        if (a.color === "#dc2626") return -1;
        if (b.color === "#dc2626") return 1;
        return a.title.localeCompare(b.title);
      });

      setAlerts(results);
    }

    const equipmentUnsub = onSnapshot(
      collection(db, "equipmentInventory"),
      (snapshot) => {
        equipment = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Equipment),
        }));

        buildAlerts();
      }
    );

    const maintenanceUnsub = onSnapshot(
      collection(db, "maintenanceInventory"),
      (snapshot) => {
        maintenance = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as MaintenanceItem),
        }));

        buildAlerts();
      }
    );

    return () => {
      equipmentUnsub();
      maintenanceUnsub();
    };
  }, []);

  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 24,
display: "flex",
flexDirection: "column",
maxHeight: 360,      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          flexShrink: 0,
        }}
      >
        <AlertTriangle
          color="#dc2626"
          size={24}
        />

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Department Alerts
        </h2>
      </div>

      {alerts.length === 0 ? (
        <div
          style={{
            color: theme.colors.textLight,
          }}
        >
          🟢 No department alerts.
        </div>
      ) : (

<div
  style={{
    overflowY: "auto",
    maxHeight: 270,
    paddingRight: 8,
  }}
>

          {alerts.map((alert, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
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
                  fontWeight: 500,
                }}
              >
                {alert.title}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}