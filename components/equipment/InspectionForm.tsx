"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";

import { Equipment } from "@/lib/types/equipment";
import { EquipmentInspection } from "@/lib/types/equipmentInspection";

interface Props {
  equipment: Equipment;
  onSave: (inspection: EquipmentInspection) => void;
  onCancel: () => void;
}

export default function InspectionForm({
  equipment,
  onSave,
  onCancel,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [inspectionDate, setInspectionDate] =
    useState(today);

  const [inspector, setInspector] =
    useState("");

  const [result, setResult] =
    useState<"Pass" | "Fail">("Pass");

  const [notes, setNotes] =
    useState("");

  function calculateNextDue() {
    const date = new Date(inspectionDate);

    switch (equipment.inspectionUnit) {
      case "Days":
        date.setDate(
          date.getDate() +
            equipment.inspectionInterval
        );
        break;

      case "Weeks":
        date.setDate(
          date.getDate() +
            equipment.inspectionInterval * 7
        );
        break;

      case "Months":
        date.setMonth(
          date.getMonth() +
            equipment.inspectionInterval
        );
        break;

      case "Years":
        date.setFullYear(
          date.getFullYear() +
            equipment.inspectionInterval
        );
        break;
    }

    return Timestamp.fromDate(date);
  }

  function handleSubmit() {
    if (!inspector.trim()) {
      alert("Inspector is required.");
      return;
    }

    onSave({
      equipmentId: equipment.id!,
      inspectionDate: Timestamp.fromDate(
        new Date(inspectionDate)
      ),
      inspector,
      result,
      notes,
      nextDueDate: calculateNextDue(),
      createdAt: Timestamp.now(),
    });
  }

  return (
    <div
      className="card"
      style={{
        marginBottom: 24,
        padding: 20,
      }}
    >
      <h2>Add Inspection</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: 20,
        }}
      >
        <div>
          <label>
            Inspection Date
          </label>

          <input
            type="date"
            value={inspectionDate}
            onChange={(e) =>
              setInspectionDate(
                e.target.value
              )
            }
            className="input"
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>
            Inspector
          </label>

          <input
            value={inspector}
            onChange={(e) =>
              setInspector(
                e.target.value
              )
            }
            className="input"
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>
            Result
          </label>

          <select
            value={result}
            onChange={(e) =>
              setResult(
                e.target.value as
                  | "Pass"
                  | "Fail"
              )
            }
            className="input"
            style={{ width: "100%" }}
          >
            <option value="Pass">
              Pass
            </option>

            <option value="Fail">
              Fail
            </option>
          </select>
        </div>

        <div
          style={{
            gridColumn:
              "1 / -1",
          }}
        >
          <label>
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value
              )
            }
            rows={5}
            className="input"
            style={{
              width: "100%",
            }}
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
          onClick={handleSubmit}
        >
          💾 Save Inspection
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