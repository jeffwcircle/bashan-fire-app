"use client";

import { Timestamp } from "firebase/firestore";

import { theme } from "@/lib/theme";
import { MaintenanceItem } from "./MaintenanceInventory";

interface Props {
  item: MaintenanceItem;
  onClick?: () => void;
}

function formatDate(value: any) {
  if (!value) return "-";

  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString();
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }

  return "-";
}

function dueStatus(value: any) {
  if (!value) {
    return {
      text: "No Due Date",
      color: "#6b7280",
    };
  }

  const due =
    value instanceof Timestamp
      ? value.toDate()
      : value.toDate();

  const days =
    (due.getTime() - Date.now()) /
    (1000 * 60 * 60 * 24);

  if (days < 0) {
    return {
      text: "🔴 OVERDUE",
      color: "#dc2626",
    };
  }

  if (days <= 7) {
    return {
      text: "🟡 DUE SOON",
      color: "#d97706",
    };
  }

  return {
    text: "🟢 CURRENT",
    color: "#16a34a",
  };
}

export default function MaintenanceCard({
  item,
  onClick,
}: Props) {


  const status = dueStatus(
    item.nextDueDate
  );

  return (
    <div
      onClick={onClick}
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 22,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
            }}
          >
            {item.name}
          </h2>

          <div
            style={{
              color:
                theme.colors.textLight,
            }}
          >
            {item.category}
          </div>
        </div>

        <div
          style={{
            fontWeight: 700,
            color: status.color,
          }}
        >
          {status.text}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        <div>
          <strong>
            Next Maintenance
          </strong>

          <br />

          {formatDate(
            item.nextDueDate
          )}
        </div>

        <div>
          <strong>Status</strong>

          <br />

          {item.status}
        </div>
      </div>
    </div>
  );
}