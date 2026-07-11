"use client";

import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";

import { Equipment } from "@/lib/types/equipment";
import { EquipmentInspection } from "@/lib/types/equipmentInspection";
import EquipmentForm from "./EquipmentForm";

interface Props {
  equipment: Equipment;
  latestInspection: EquipmentInspection | null;
  onSave: (equipment: Equipment) => Promise<void>;
  onRetire: () => Promise<void>;
}

export default function EquipmentInformation({
  equipment,
  latestInspection,
  onSave,
  onRetire,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [currentEquipment, setCurrentEquipment] =
    useState(equipment);

  useEffect(() => {
    setCurrentEquipment(equipment);
  }, [equipment]);

  async function handleSave(updated: Equipment) {
    await onSave(updated);
    setCurrentEquipment(updated);
    setEditing(false);
  }

  async function handleRetire() {
    const confirmed = window.confirm(
      "Retire this equipment?\n\nIt will remain in the database and keep all inspection history."
    );

    if (!confirmed) return;

    await onRetire();
  }

  function formatDate(value: any) {
    if (!value) return "-";

    if (value instanceof Timestamp) {
      return value.toDate().toLocaleDateString();
    }

    return "-";
  }

  const nextDue =
    latestInspection?.nextDueDate instanceof Timestamp
      ? latestInspection.nextDueDate.toDate()
      : null;

  const overdue =
    nextDue !== null &&
    nextDue.getTime() < Date.now();

  if (editing) {
    return (
      <EquipmentForm
        initialData={currentEquipment}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>
          Equipment Information
        </h2>

        <button
          className="btn btn-primary"
          onClick={() => setEditing(true)}
        >
          ✏️ Edit Equipment
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: 16,
        }}
      >
        <InfoCard
          label="Manufacturer"
          value={currentEquipment.manufacturer}
        />

        <InfoCard
          label="Model"
          value={currentEquipment.model}
        />

        <InfoCard
          label="Serial Number"
          value={currentEquipment.serialNumber}
        />

        <InfoCard
          label="Asset Number"
          value={currentEquipment.assetNumber}
        />

        <InfoCard
          label="Assigned To"
          value={currentEquipment.assignedTo}
        />

        <InfoCard
          label="Location"
          value={currentEquipment.location}
        />

        <InfoCard
          label="Status"
          value={currentEquipment.status}
        />

        <InfoCard
          label="Inspection Schedule"
          value={`Every ${currentEquipment.inspectionInterval} ${currentEquipment.inspectionUnit}`}
        />

        <InfoCard
          label="Last Inspection"
          value={formatDate(
            latestInspection?.inspectionDate
          )}
        />

        <InfoCard
          label="Next Due"
          value={formatDate(
            latestInspection?.nextDueDate
          )}
        />

        <InfoCard
          label="Inspection Status"
          value={
            latestInspection
              ? overdue
                ? "🔴 OVERDUE"
                : "🟢 CURRENT"
              : "-"
          }
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
              textTransform: "uppercase",
            }}
          >
            Notes
          </div>

          <div>
            {currentEquipment.notes || "-"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 24,
        }}
      >
        <button
          className="btn btn-danger"
          onClick={handleRetire}
        >
          🗑️ Retire Equipment
        </button>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string;
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
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 600,
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}