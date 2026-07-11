"use client";

import { Timestamp } from "firebase/firestore";

import { EquipmentInspection } from "@/lib/types/equipmentInspection";

interface Props {
  inspection: EquipmentInspection;
}

function formatDate(value: any) {
  if (!value) return "-";

  if (value instanceof Timestamp) {
    return value
      .toDate()
      .toLocaleDateString();
  }

  return "-";
}

export default function InspectionCard({
  inspection,
}: Props) {
  const passed =
    inspection.result === "Pass";

  return (
    <div
      className="card"
      style={{
        padding: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <h3
          style={{
            margin: 0,
          }}
        >
          {passed ? "✅ PASS" : "❌ FAIL"}
        </h3>

        <strong>
          {formatDate(
            inspection.inspectionDate
          )}
        </strong>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 12,
        }}
      >
        <div>
          <strong>Inspector</strong>

          <br />

          {inspection.inspector}
        </div>

        <div>
          <strong>Next Due</strong>

          <br />

          {formatDate(
            inspection.nextDueDate
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
        }}
      >
        <strong>Notes</strong>

        <div
          style={{
            marginTop: 6,
          }}
        >
          {inspection.notes || "-"}
        </div>
      </div>
    </div>
  );
}