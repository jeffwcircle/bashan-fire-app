"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";

interface MaintenanceRecord {
  performedDate: any;
  performedBy: string;
  hours?: number;
  mileage?: number;
  cost?: number;
  vendor?: string;
  notes: string;
}

interface Props {
  onSave: (record: MaintenanceRecord) => void;
  onCancel: () => void;
}

export default function MaintenanceRecordForm({
  onSave,
  onCancel,
}: Props) {
  const [record, setRecord] =
    useState<MaintenanceRecord>({
      performedDate: Timestamp.now(),
      performedBy: "",
      hours: undefined,
      mileage: undefined,
      cost: undefined,
      vendor: "",
      notes: "",
    });

  function update(
    field: keyof MaintenanceRecord,
    value: any
  ) {
    setRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSave() {
    // Build a clean record so Firebase never receives
    // undefined values.
    const cleanRecord: MaintenanceRecord = {
      performedDate: record.performedDate,
      performedBy: record.performedBy,
      vendor: record.vendor,
      notes: record.notes,
    };

    // Only add hours if a value was entered.
    if (record.hours !== undefined) {
      cleanRecord.hours = record.hours;
    }

    // Only add mileage if a value was entered.
    if (record.mileage !== undefined) {
      cleanRecord.mileage = record.mileage;
    }

    // Only add cost if a value was entered.
    if (record.cost !== undefined) {
      cleanRecord.cost = record.cost;
    }

    onSave(cleanRecord);
  }

  return (
    <div className="card">
      <h2>Add Maintenance Record</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: 20,
        }}
      >
        <div>
          <label>Performed By</label>

          <input
            className="input"
            style={{ width: "100%" }}
            value={record.performedBy}
            onChange={(e) =>
              update(
                "performedBy",
                e.target.value
              )
            }
          />
        </div>

        <div>
          <label>Hours</label>

          <input
            type="number"
            className="input"
            style={{ width: "100%" }}
            value={record.hours ?? ""}
            onChange={(e) =>
              update(
                "hours",
                e.target.value === ""
                  ? undefined
                  : Number(e.target.value)
              )
            }
          />
        </div>

        <div>
          <label>Mileage</label>

          <input
            type="number"
            className="input"
            style={{ width: "100%" }}
            value={record.mileage ?? ""}
            onChange={(e) =>
              update(
                "mileage",
                e.target.value === ""
                  ? undefined
                  : Number(e.target.value)
              )
            }
          />
        </div>

        <div>
          <label>Cost</label>

          <input
            type="number"
            step="0.01"
            className="input"
            style={{ width: "100%" }}
            value={record.cost ?? ""}
            onChange={(e) =>
              update(
                "cost",
                e.target.value === ""
                  ? undefined
                  : Number(e.target.value)
              )
            }
          />
        </div>

        <div>
          <label>Vendor</label>

          <input
            className="input"
            style={{ width: "100%" }}
            value={record.vendor}
            onChange={(e) =>
              update(
                "vendor",
                e.target.value
              )
            }
          />
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
          }}
        >
          <label>Notes</label>

          <textarea
            rows={5}
            className="input"
            style={{ width: "100%" }}
            value={record.notes}
            onChange={(e) =>
              update(
                "notes",
                e.target.value
              )
            }
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 24,
        }}
      >
        <button
          className="btn btn-primary"
          onClick={handleSave}
        >
          💾 Save
        </button>

        <button
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}