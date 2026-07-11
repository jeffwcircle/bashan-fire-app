"use client";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { Equipment } from "@/lib/types/equipment";
import { EquipmentInspection } from "@/lib/types/equipmentInspection";

import InspectionCard from "./InspectionCard";
import InspectionForm from "./InspectionForm";

interface Props {
  equipment: Equipment;
  onLatestInspectionChange?: (
    inspection: EquipmentInspection | null
  ) => void;
}

export default function InspectionHistory({
  equipment,
  onLatestInspectionChange,
}: Props) {
  const [inspections, setInspections] =
    useState<EquipmentInspection[]>([]);

  const [addingInspection, setAddingInspection] =
    useState(false);

  useEffect(() => {
    if (!equipment.id) return;

    const q = query(
      collection(db, "equipmentInspections"),
      where("equipmentId", "==", equipment.id),
      orderBy("inspectionDate", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as EquipmentInspection),
      }));

      setInspections(data);

      onLatestInspectionChange?.(
        data.length ? data[0] : null
      );
    });

    return () => unsub();
  }, [equipment.id, onLatestInspectionChange]);

  async function handleSave(
    inspection: EquipmentInspection
  ) {
    // Save inspection history
    await addDoc(
      collection(db, "equipmentInspections"),
      {
        ...inspection,
        createdAt: Timestamp.now(),
      }
    );

    // Update equipment with latest dates
    if (equipment.id) {
      await updateDoc(
        doc(
          db,
          "equipmentInventory",
          equipment.id
        ),
        {
          lastInspectionDate:
            inspection.inspectionDate,
          nextDueDate:
            inspection.nextDueDate,
        }
      );
    }

    setAddingInspection(false);
  }

  return (
    <div
      className="card"
      style={{
        marginTop: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>
          Inspection History
        </h2>

        {!addingInspection && (
          <button
            className="btn btn-success"
            onClick={() =>
              setAddingInspection(true)
            }
          >
            ➕ Add Inspection
          </button>
        )}
      </div>

      {addingInspection && (
        <div
          style={{
            marginTop: 24,
          }}
        >
          <InspectionForm
            equipment={equipment}
            onSave={handleSave}
            onCancel={() =>
              setAddingInspection(false)
            }
          />
        </div>
      )}

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gap: 16,
        }}
      >
        {inspections.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: 30,
            }}
          >
            No inspections have been
            recorded.
          </div>
        ) : (
          inspections.map((inspection) => (
            <InspectionCard
              key={inspection.id}
              inspection={inspection}
            />
          ))
        )}
      </div>
    </div>
  );
}