"use client";

import { Equipment } from "@/lib/types/equipment";
import { theme } from "@/lib/theme";

interface Props {
  equipment: Equipment;
  onClick?: () => void;
}

function statusColor(status: string) {
  switch (status) {
    case "In Service":
      return "#16a34a";

    case "Out for Repair":
      return "#f59e0b";

    case "Out of Service":
      return "#dc2626";

    case "Retired":
      return "#6b7280";

    default:
      return "#6b7280";
  }
}

export default function EquipmentCard({
  equipment,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 22,
        cursor: "pointer",
        transition: ".2s",
        border: "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 12px 24px rgba(0,0,0,.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          theme.shadow.card;
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
            }}
          >
            {equipment.name}
          </h2>

          <div
            style={{
              color: theme.colors.textLight,
              marginTop: 4,
            }}
          >
            {equipment.type}
          </div>
        </div>

        <div
          style={{
            background: statusColor(
              equipment.status
            ),
            color: "white",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {equipment.status}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 10,
          fontSize: 15,
        }}
      >
        <div>
          <strong>Assigned To</strong>

          <br />

          {equipment.assignedTo || "-"}
        </div>

        <div>
          <strong>Location</strong>

          <br />

          {equipment.location || "-"}
        </div>

        <div>
          <strong>Schedule</strong>

          <br />

          Every {equipment.inspectionInterval}{" "}
          {equipment.inspectionUnit}
        </div>
      </div>
    </div>
  );
}