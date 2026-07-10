"use client";

import { useState, useEffect } from "react";
import { Equipment } from "@/lib/types/equipment";
import { theme } from "@/lib/theme";

interface Props {
  initialData?: Equipment;
  onSave: (equipment: Equipment) => void;
  onCancel: () => void;
}

export default function EquipmentForm({
  initialData,
  onSave,
  onCancel,
}: Props) {
  const [equipment, setEquipment] =
    useState<Equipment>({
      name: "",
      type: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      assetNumber: "",
      assignedTo: "",
      location: "",
      status: "In Service",
      inspectionInterval: 30,
      inspectionUnit: "Days",
      notes: "",
    });

  useEffect(() => {
    if (initialData) {
      setEquipment(initialData);
    }
  }, [initialData]);

  function update<K extends keyof Equipment>(
    field: K,
    value: Equipment[K]
  ) {
    setEquipment((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSubmit() {
    if (!equipment.name.trim()) {
      alert("Equipment name is required.");
      return;
    }

    if (!equipment.type.trim()) {
      alert("Equipment type is required.");
      return;
    }

    onSave(equipment);
  }

  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 24,
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 24,
        }}
      >
        {initialData
          ? "Edit Equipment"
          : "Add Equipment"}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        <Input
          label="Equipment Name"
          value={equipment.name}
          onChange={(v) =>
            update("name", v)
          }
        />

        <Input
          label="Equipment Type"
          value={equipment.type}
          onChange={(v) =>
            update("type", v)
          }
        />

        <Input
          label="Manufacturer"
          value={equipment.manufacturer}
          onChange={(v) =>
            update("manufacturer", v)
          }
        />

        <Input
          label="Model"
          value={equipment.model}
          onChange={(v) =>
            update("model", v)
          }
        />

        <Input
          label="Serial Number"
          value={equipment.serialNumber}
          onChange={(v) =>
            update("serialNumber", v)
          }
        />

        <Input
          label="Asset Number"
          value={equipment.assetNumber}
          onChange={(v) =>
            update("assetNumber", v)
          }
        />

        <Input
          label="Assigned To"
          value={equipment.assignedTo}
          onChange={(v) =>
            update("assignedTo", v)
          }
        />

        <Input
          label="Location"
          value={equipment.location}
          onChange={(v) =>
            update("location", v)
          }
        />

        <div>
          <Label>Status</Label>

          <select
            value={equipment.status}
            onChange={(e) =>
              update(
                "status",
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option>
              In Service
            </option>

            <option>
              Out for Repair
            </option>

            <option>
              Out of Service
            </option>

            <option>
              Retired
            </option>
          </select>
        </div>

        <div>
          <Label>
            Inspection Interval
          </Label>

          <input
            type="number"
            min={1}
            value={
              equipment.inspectionInterval
            }
            onChange={(e) =>
              update(
                "inspectionInterval",
                Number(
                  e.target.value
                )
              )
            }
            style={inputStyle}
          />
        </div>

        <div>
          <Label>
            Inspection Unit
          </Label>

          <select
            value={
              equipment.inspectionUnit
            }
            onChange={(e) =>
              update(
                "inspectionUnit",
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option>Days</option>
            <option>Weeks</option>
            <option>Months</option>
            <option>Years</option>
          </select>
        </div>

        <div
          style={{
            gridColumn:
              "1 / -1",
          }}
        >
          <Label>Notes</Label>

          <textarea
            value={equipment.notes}
            onChange={(e) =>
              update(
                "notes",
                e.target.value
              )
            }
            style={{
              ...inputStyle,
              minHeight: 120,
              resize: "vertical",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 30,
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          💾 Save Equipment
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

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontWeight: 600,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={inputStyle}
      />
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 15,
} as const;

const selectStyle = {
  ...inputStyle,
  background: "white",
};