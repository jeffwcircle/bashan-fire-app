"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Equipment } from "@/lib/types/equipment";

import EquipmentCard from "./EquipmentCard";
import EquipmentForm from "./EquipmentForm";

export default function EquipmentInventory() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "equipmentInventory"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Equipment),
        }));

        data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setEquipment(data);
      }
    );

    return () => unsub();
  }, []);

  async function handleSave(item: Equipment) {
    await addDoc(
      collection(db, "equipmentInventory"),
      {
        ...item,
        createdAt: Timestamp.now(),
      }
    );

    setShowForm(false);
  }

  return (
    <>
      {!showForm && (
        <button
          className="btn btn-success"
          style={{
            width: "100%",
            padding: 16,
            marginBottom: 24,
          }}
          onClick={() => setShowForm(true)}
        >
          ➕ Add Equipment
        </button>
      )}

      {showForm && (
        <EquipmentForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div
        style={{
          display: "grid",
          gap: 20,
          marginTop: 24,
        }}
      >
        {equipment.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: 40,
            }}
          >
            No equipment has been added yet.
          </div>
        ) : (
          equipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
            />
          ))
        )}
      </div>
    </>
  );
}