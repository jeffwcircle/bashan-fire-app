"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { MaintenanceItem } from "./MaintenanceInventory";
import MaintenanceInformation from "./MaintenanceInformation";
import MaintenanceHistory from "./MaintenanceHistory";

export default function MaintenanceDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] =
    useState<MaintenanceItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadItem();
  }, [id]);

  async function loadItem() {
    if (!id) return;

    const snap = await getDoc(
      doc(
        db,
        "maintenanceInventory",
        id as string
      )
    );

    if (snap.exists()) {
      setItem({
        id: snap.id,
        ...(snap.data() as MaintenanceItem),
      });
    }

    setLoading(false);
  }

  async function handleSave(
    updated: MaintenanceItem
  ) {
    if (!updated.id) return;

    const { id, ...data } = updated;

    await updateDoc(
      doc(
        db,
        "maintenanceInventory",
        id
      ),
      data
    );

    setItem(updated);
  }

  async function handleMaintenanceUpdate(
    lastMaintenanceDate: any,
    nextDueDate: any
  ) {
    if (!item?.id) return;

    await updateDoc(
      doc(
        db,
        "maintenanceInventory",
        item.id
      ),
      {
        lastMaintenanceDate,
        nextDueDate,
      }
    );

    setItem({
      ...item,
      lastMaintenanceDate,
      nextDueDate,
    });
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!item) {
    return (
      <p>Maintenance item not found.</p>
    );
  }

  return (
    <>
      <button
        className="btn btn-secondary"
        onClick={() =>
          router.push("/maintenance")
        }
        style={{
          marginBottom: 24,
        }}
      >
        ← Back to Maintenance
      </button>

      <MaintenanceInformation
        item={item}
        onSave={handleSave}
      />

      <MaintenanceHistory
        item={item}
        onMaintenanceSaved={
          handleMaintenanceUpdate
        }
      />
    </>
  );
}