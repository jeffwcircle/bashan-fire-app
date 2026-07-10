"use client";

import { useRouter } from "next/navigation";

import PageContainer from "@/components/PageContainer";
import EquipmentInventory from "@/components/equipment/EquipmentInventory";

export default function EquipmentInventoryPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="Equipment Inventory"
      subtitle="Manage department equipment."
    >
      <button
        className="btn btn-secondary"
        onClick={() =>
          router.push("/equipment")
        }
        style={{
          marginBottom: 24,
        }}
      >
        ← Equipment
      </button>

      <EquipmentInventory />
    </PageContainer>
  );
}