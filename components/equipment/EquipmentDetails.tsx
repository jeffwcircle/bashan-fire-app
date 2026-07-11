"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Equipment } from "@/lib/types/equipment";
import { EquipmentInspection } from "@/lib/types/equipmentInspection";

import EquipmentInformation from "./EquipmentInformation";
import InspectionHistory from "./InspectionHistory";

export default function EquipmentDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [equipment, setEquipment] =
    useState<Equipment | null>(null);

  const [latestInspection, setLatestInspection] =
    useState<EquipmentInspection | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadEquipment();
  }, [id]);

  async function loadEquipment() {
    if (!id) return;

    const snap = await getDoc(
      doc(db, "equipmentInventory", id as string)
    );

    if (snap.exists()) {
      setEquipment({
        id: snap.id,
        ...(snap.data() as Equipment),
      });
    }

    setLoading(false);
  }

  async function handleSave(updated: Equipment) {
    if (!updated.id) return;

    const { id, ...equipmentData } = updated;

    await updateDoc(
      doc(db, "equipmentInventory", id),
      equipmentData
    );

    setEquipment(updated);
  }

  async function handleRetire() {
    if (!equipment?.id) return;

    const updated = {
      ...equipment,
      status: "Retired",
    };

    const { id, ...equipmentData } = updated;

    await updateDoc(
      doc(db, "equipmentInventory", id!),
      equipmentData
    );

    setEquipment(updated);
  }

  if (loading) return <p>Loading...</p>;

  if (!equipment)
    return <p>Equipment not found.</p>;

  return (
    <>
      <button
        className="btn btn-secondary"
        onClick={() =>
          router.push("/equipment/inventory")
        }
        style={{ marginBottom: 24 }}
      >
        ← Back to Inventory
      </button>

      <EquipmentInformation
        equipment={equipment}
        latestInspection={latestInspection}
        onSave={handleSave}
        onRetire={handleRetire}
      />

      <InspectionHistory
        equipment={equipment}
        onLatestInspectionChange={
          setLatestInspection
        }
      />
    </>
  );
}