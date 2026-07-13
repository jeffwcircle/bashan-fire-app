"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import MaintenanceCard from "./MaintenanceCard";
import MaintenanceForm from "./MaintenanceForm";

export interface MaintenanceItem {
  id?: string;

  name: string;
  category: string;

  interval: number;
  intervalUnit:
    | "Days"
    | "Weeks"
    | "Months"
    | "Years";

  status: string;

  notes: string;

  lastMaintenanceDate?: any;
  nextDueDate?: any;

  createdAt?: any;
}

export default function MaintenanceInventory() {
  const router = useRouter();

  const [items, setItems] = useState<
    MaintenanceItem[]
  >([]);

  const [showForm, setShowForm] =
    useState(false);

  const [showRetired, setShowRetired] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState<
      MaintenanceItem | undefined
    >();

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "maintenanceInventory"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as MaintenanceItem),
        }));

        data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setItems(data);
      }
    );

    return () => unsub();
  }, []);

  async function handleSave(
    item: MaintenanceItem
  ) {
    if (item.id) {
      const { id, ...data } = item;

      await updateDoc(
        doc(
          db,
          "maintenanceInventory",
          id
        ),
        data
      );
    } else {
      await addDoc(
        collection(
          db,
          "maintenanceInventory"
        ),
        {
          ...item,
          createdAt: Timestamp.now(),
        }
      );
    }

    setShowForm(false);
    setSelectedItem(undefined);
  }

  const filteredItems = showRetired
    ? items
    : items.filter(
        (item) => item.status !== "Retired"
      );

  return (
    <>
      {!showForm && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <button
              className="btn btn-success"
              onClick={() => {
                setSelectedItem(undefined);
                setShowForm(true);
              }}
            >
              ➕ Add Maintenance Item
            </button>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 500,
                cursor: "pointer",
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
              Show Retired
            </label>
          </div>
        </>
      )}

      {showForm && (
        <MaintenanceForm
          initialData={selectedItem}
          onSave={handleSave}
          onCancel={() =>
            setShowForm(false)
          }
        />
      )}

      <div
        style={{
          display: "grid",
          gap: 20,
        }}
      >
        {filteredItems.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: 40,
            }}
          >
            No maintenance items.
          </div>
        ) : (
          filteredItems.map((item) => (
            <MaintenanceCard
              key={item.id}
              item={item}
              onClick={() =>
                router.push(
                  `/maintenance/${item.id}`
                )
              }
            />
          ))
        )}
      </div>
    </>
  );
}