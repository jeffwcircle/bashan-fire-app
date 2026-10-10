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
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 20,
        }}
      >
        <button
          className="btn btn-secondary"
          style={{
            padding: "10px 18px",
          }}
          onClick={() =>
            router.push("/equipment/inventory")
          }
        >
          📦 Equipment Inventory
        </button>

        <button
          className="btn btn-secondary"
          style={{
            padding: "10px 18px",
          }}
          onClick={() =>
            router.push("/equipment/testing")
          }
        >
          🧪 Equipment Testing
        </button>

        <button
          className="btn btn-secondary"
          style={{
            padding: "10px 18px",
          }}
          onClick={() =>
            router.push("/equipment/procedures")
          }
        >
          📋 Equipment Procedures
        </button>
      </div>
    </PageContainer>
  );
}