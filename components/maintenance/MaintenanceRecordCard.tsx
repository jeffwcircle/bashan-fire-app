"use client";

import { Timestamp } from "firebase/firestore";
import { theme } from "@/lib/theme";

interface Props {
  record: {
    performedDate: any;
    performedBy: string;
    hours?: number;
    mileage?: number;
    cost?: number;
    vendor?: string;
    notes: string;
    nextDueDate: any;
  };
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

function money(value?: number) {
  if (value == null) return "-";

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function MaintenanceRecordCard({
  record,
}: Props) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <strong>
          {formatDate(record.performedDate)}
        </strong>

        <div
          style={{
            color: theme.colors.textLight,
          }}
        >
          {record.performedBy || "-"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <strong>Hours</strong>
          <br />
          {record.hours ?? "-"}
        </div>

        <div>
          <strong>Mileage</strong>
          <br />
          {record.mileage ?? "-"}
        </div>

        <div>
          <strong>Cost</strong>
          <br />
          {money(record.cost)}
        </div>

        <div>
          <strong>Vendor</strong>
          <br />
          {record.vendor || "-"}
        </div>
      </div>

      <div
        style={{
          marginBottom: 18,
        }}
      >
        <strong>Notes</strong>

        <div
          style={{
            marginTop: 6,
          }}
        >
          {record.notes || "-"}
        </div>
      </div>

      <div
        style={{
          fontWeight: 700,
          color: theme.colors.primary,
        }}
      >
        Next Due: {formatDate(record.nextDueDate)}
      </div>
    </div>
  );
}