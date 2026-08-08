"use client";

import { usePermissions } from "@/components/auth/PermissionProvider";

import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";

import {
  MaintenanceItem,
} from "./MaintenanceInventory";
import MaintenanceForm from "./MaintenanceForm";

interface Props {
  item: MaintenanceItem;
  onSave: (
    item: MaintenanceItem
  ) => Promise<void>;
}

export default function MaintenanceInformation({
  item,
  onSave,
}: Props) {
  const [editing, setEditing] =
    useState(false);

  const { can } = usePermissions();

  const [currentItem, setCurrentItem] =
    useState(item);

  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  async function handleSave(
    updated: MaintenanceItem
  ) {
    await onSave(updated);
    setCurrentItem(updated);
    setEditing(false);
  }

  async function retireItem() {
    if (
      !confirm(
        "Retire this maintenance item?"
      )
    )
      return;

    await handleSave({
      ...currentItem,
      status: "Retired",
    });
  }

  function formatDate(value: any) {
    if (!value) return "-";

    if (value instanceof Timestamp) {
      return value
        .toDate()
        .toLocaleDateString();
    }

    if (
      typeof value?.toDate === "function"
    ) {
      return value
        .toDate()
        .toLocaleDateString();
    }

    return "-";
  }

  function maintenanceStatus() {
    if (!currentItem.nextDueDate) {
      return {
        text: "No Due Date",
        color: "#6b7280",
      };
    }

    const due =
      currentItem.nextDueDate instanceof
      Timestamp
        ? currentItem.nextDueDate.toDate()
        : currentItem.nextDueDate.toDate();

    const days =
      (due.getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);

    if (days < 0)
      return {
        text: "🔴 OVERDUE",
        color: "#dc2626",
      };

    if (days <= 7)
      return {
        text: "🟡 DUE SOON",
        color: "#d97706",
      };

    return {
      text: "🟢 CURRENT",
      color: "#16a34a",
    };
  }

  const status =
    maintenanceStatus();

  if (editing) {
    return (
      <MaintenanceForm
        initialData={currentItem}
        onSave={handleSave}
        onCancel={() =>
          setEditing(false)
        }
      />
    );
  }

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>
          Maintenance Information
        </h2>

	{can("maintenance_edit") && (
        <button
          className="btn btn-primary"
          onClick={() =>
            setEditing(true)
          }
        >
          ✏️ Edit
        </button>
      )}

      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: 16,
        }}
      >
        <InfoCard
          label="Name"
          value={currentItem.name}
        />

        <InfoCard
          label="Category"
          value={currentItem.category}
        />

        <InfoCard
          label="Status"
          value={currentItem.status}
        />

        <InfoCard
          label="Maintenance Interval"
          value={`${currentItem.interval} ${currentItem.intervalUnit}`}
        />

        <InfoCard
          label="Last Maintenance"
          value={formatDate(
            currentItem.lastMaintenanceDate
          )}
        />

        <InfoCard
          label="Next Due"
          value={formatDate(
            currentItem.nextDueDate
          )}
        />

        <InfoCard
          label="Maintenance Status"
          value={status.text}
          color={status.color}
        />

        <div
          className="card"
          style={{
            gridColumn: "1 / -1",
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#6b7280",
              marginBottom: 8,
              textTransform:
                "uppercase",
            }}
          >
            Notes
          </div>

          <div>
            {currentItem.notes || "-"}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
        }}
      >

	{can("maintenance_edit") && (
        <button
          className="btn btn-danger"
          onClick={retireItem}
        >
          🗑️ Retire Item
        </button>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  color,
}: {
  label: string;
  value?: string;
  color?: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#6b7280",
          marginBottom: 8,
          textTransform:
            "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 600,
          color,
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}