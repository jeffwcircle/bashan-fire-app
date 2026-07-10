"use client";

import { useRouter } from "next/navigation";

import PageContainer from "@/components/PageContainer";

export default function EquipmentPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="Equipment"
      subtitle="Manage department equipment and testing."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px,1fr))",
          gap: 24,
          marginTop: 20,
        }}
      >
        {/* Inventory */}

        <div
          className="card"
          style={{
            cursor: "pointer",
            padding: 32,
          }}
          onClick={() =>
            router.push("/equipment/inventory")
          }
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            📦
          </div>

          <h2
            style={{
              marginTop: 0,
            }}
          >
            Equipment Inventory
          </h2>

          <p>
            Manage equipment, assignments,
            inspection schedules and
            inventory.
          </p>
        </div>

        {/* Testing */}

        <div
          className="card"
          style={{
            cursor: "pointer",
            padding: 32,
          }}
          onClick={() =>
            router.push("/equipment/testing")
          }
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            🧪
          </div>

          <h2
            style={{
              marginTop: 0,
            }}
          >
            Equipment Testing
          </h2>

          <p>
            Perform inspections using your
            testing templates and record
            results.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}