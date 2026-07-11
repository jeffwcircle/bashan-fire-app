"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Equipment } from "@/lib/types/equipment";

import EquipmentCard from "./EquipmentCard";
import EquipmentForm from "./EquipmentForm";

export default function EquipmentInventory() {
  const router = useRouter();

  const [equipment, setEquipment] =
    useState<Equipment[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [showRetired, setShowRetired] =
    useState(false);

  const [selectedEquipment, setSelectedEquipment] =
    useState<Equipment | undefined>();


useEffect(() => {
  const unsub = onSnapshot(
    collection(db, "equipmentInventory"),
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Equipment),
      }));

      data.sort((a, b) => {
        function priority(item: Equipment) {
          if (item.status === "Retired") return 99;

          if (!item.nextDueDate) return 50;

          const due =
            item.nextDueDate.toDate();

          const now = new Date();

          const days =
            (due.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24);

          if (days < 0) return 0;

          if (days <= 7) return 1;

          return 2;
        }

        const p =
          priority(a) - priority(b);

        if (p !== 0) return p;

        if (
          a.nextDueDate &&
          b.nextDueDate
        ) {
          return (
            a.nextDueDate.toDate().getTime() -
            b.nextDueDate.toDate().getTime()
          );
        }

        return a.name.localeCompare(b.name);
      });

      setEquipment(data);
    }
  );

  return () => unsub();
}, []);


  async function handleSave(item: Equipment) {
    if (item.id) {
      const { id, ...equipmentData } = item;

      await updateDoc(
        doc(db, "equipmentInventory", id),
        equipmentData
      );
    } else {
      await addDoc(
        collection(db, "equipmentInventory"),
        {
          ...item,
          createdAt: Timestamp.now(),
        }
      );
    }

    setSelectedEquipment(undefined);
    setShowForm(false);
  }

  function handleCancel() {
    setSelectedEquipment(undefined);
    setShowForm(false);
  }

  const visibleEquipment = useMemo(() => {
    if (showRetired) return equipment;

    return equipment.filter(
      (item) => item.status !== "Retired"
    );
  }, [equipment, showRetired]);

  return (
    <>
      {!showForm && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <button
              className="btn btn-success"
              onClick={() => {
                setSelectedEquipment(undefined);
                setShowForm(true);
              }}
            >
              ➕ Add Equipment
            </button>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={showRetired}
                onChange={(e) =>
                  setShowRetired(
                    e.target.checked
                  )
                }
              />

              Show Retired Equipment
            </label>
          </div>
        </>
      )}

      {showForm && (
        <EquipmentForm
          initialData={selectedEquipment}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div
        style={{
          display: "grid",
          gap: 20,
        }}
      >
        {visibleEquipment.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: 40,
            }}
          >
            No equipment found.
          </div>
        ) : (
          visibleEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onClick={() =>
                router.push(
                  `/equipment/${item.id}`
                )
              }
            />
          ))
        )}
      </div>
    </>
  );
}