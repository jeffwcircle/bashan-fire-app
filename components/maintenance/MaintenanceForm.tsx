"use client";

import { useState } from "react";
import { MaintenanceItem } from "./MaintenanceInventory";

interface Props {
  initialData?: MaintenanceItem;
  onSave: (item: MaintenanceItem) => void;
  onCancel: () => void;
}

export default function MaintenanceForm({
  initialData,
  onSave,
  onCancel,
}: Props) {
  const [item, setItem] =
    useState<MaintenanceItem>(
      initialData || {
        name: "",
        category: "",
        interval: 12,
        intervalUnit: "Months",
        status: "Active",
        notes: "",
      }
    );

  function update(
    field: keyof MaintenanceItem,
    value: any
  ) {
    setItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="card">
      <h2>
        {initialData
          ? "Edit Maintenance Item"
          : "Add Maintenance Item"}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: 20,
        }}
      >
        <div>
          <label>Name</label>

          <input
            className="input"
            style={{ width: "100%" }}
            value={item.name}
            onChange={(e) =>
              update("name", e.target.value)
            }
          />
        </div>

        <div>
          <label>Category</label>

          <input
            className="input"
            style={{ width: "100%" }}
            value={item.category}
            onChange={(e) =>
              update(
                "category",
                e.target.value
              )
            }
          />
        </div>

        <div>
          <label>
            Maintenance Interval
          </label>

          <input
            type="number"
            className="input"
            style={{ width: "100%" }}
            value={item.interval}
            onChange={(e) =>
              update(
                "interval",
                Number(e.target.value)
              )
            }
          />
        </div>

        <div>
          <label>Interval Unit</label>

          <select
            className="input"
            style={{ width: "100%" }}
            value={item.intervalUnit}
            onChange={(e) =>
              update(
                "intervalUnit",
                e.target.value
              )
            }
          >
            <option>Days</option>
            <option>Weeks</option>
            <option>Months</option>
            <option>Years</option>
          </select>
        </div>

        <div>
          <label>Status</label>

          <select
            className="input"
            style={{ width: "100%" }}
            value={item.status}
            onChange={(e) =>
              update(
                "status",
                e.target.value
              )
            }
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
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
            value={item.notes}
            onChange={(e) =>
              update("notes", e.target.value)
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
          onClick={() => onSave(item)}
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