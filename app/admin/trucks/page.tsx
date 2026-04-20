"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { useRouter } from "next/navigation";

type Item = { name: string };

type Bay = {
  name: string;
  items: Item[];
};

type Truck = {
  id: string;
  bays: Bay[];
};

export default function TruckAdmin() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [newTruck, setNewTruck] = useState("");
  const router = useRouter();

  // ---------------- LOAD ----------------
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const snap = await getDocs(collection(db, "truckTemplates"));

    const data: Truck[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any)
    }));

    setTrucks(data);
  };

  // ---------------- CREATE TRUCK ----------------
  const createTruck = async () => {
    if (!newTruck) return;

    await setDoc(doc(db, "truckTemplates", newTruck), {
      bays: []
    });

    setNewTruck("");
    load();
  };

  // ---------------- ADD BAY ----------------
  const addBay = async (truckId: string) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    const updated: Truck = {
      ...truck,
      bays: [...(truck.bays || []), { name: "New Bay", items: [] }]
    };

    await setDoc(doc(db, "truckTemplates", truckId), updated);
    load();
  };

  // ---------------- RENAME BAY ----------------
  const renameBay = async (truckId: string, index: number, name: string) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[index].name = name;

    await setDoc(doc(db, "truckTemplates", truckId), {
      bays
    });

    load();
  };

  // ---------------- DELETE BAY ----------------
  const deleteBay = async (truckId: string, bayIndex: number) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays.splice(bayIndex, 1);

    await setDoc(doc(db, "truckTemplates", truckId), {
      bays
    });

    load();
  };

  // ---------------- ADD ITEM ----------------
  const addItem = async (truckId: string, bayIndex: number) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[bayIndex].items.push({ name: "New Item" });

    await setDoc(doc(db, "truckTemplates", truckId), {
      bays
    });

    load();
  };

  // ---------------- RENAME ITEM ----------------
  const renameItem = async (
    truckId: string,
    bayIndex: number,
    itemIndex: number,
    name: string
  ) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[bayIndex].items[itemIndex].name = name;

    await setDoc(doc(db, "truckTemplates", truckId), {
      bays
    });

    load();
  };

  // ---------------- DELETE ITEM ----------------
  const deleteItem = async (
    truckId: string,
    bayIndex: number,
    itemIndex: number
  ) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[bayIndex].items.splice(itemIndex, 1);

    await setDoc(doc(db, "truckTemplates", truckId), {
      bays
    });

    load();
  };

  // ---------------- DELETE TRUCK ----------------
  const deleteTruck = async (id: string) => {
    await deleteDoc(doc(db, "truckTemplates", id));
    load();
  };

  // ---------------- UI ----------------
  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push("/")}>⬅ Back</button>

      <h1>🚒 Truck Admin</h1>

      {/* CREATE TRUCK */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={newTruck}
          placeholder="New Truck Name"
          onChange={(e) => setNewTruck(e.target.value)}
        />
        <button onClick={createTruck}>Create</button>
      </div>

      {/* TRUCK LIST */}
      {trucks.map(truck => (
        <div key={truck.id} style={{ border: "1px solid #ccc", marginBottom: 15, padding: 10 }}>
          
          {/* HEADER */}
          <h3>
            🚒 {truck.id}
            <button onClick={() => deleteTruck(truck.id)} style={{ marginLeft: 10, color: "red" }}>
              Delete Truck
            </button>
          </h3>

          <button onClick={() => addBay(truck.id)}>
            + Add Bay
          </button>

          {/* BAYS */}
          {truck.bays?.map((bay, bIndex) => (
            <div key={bIndex} style={{ marginLeft: 20, marginTop: 10 }}>
              
              <input
                value={bay.name}
                onChange={(e) =>
                  renameBay(truck.id, bIndex, e.target.value)
                }
              />

              <button onClick={() => addItem(truck.id, bIndex)} style={{ marginLeft: 10 }}>
                + Add Item
              </button>

              <button
                onClick={() => deleteBay(truck.id, bIndex)}
                style={{ marginLeft: 10, color: "red" }}
              >
                Delete Bay
              </button>

              {/* ITEMS */}
              {bay.items?.map((item, iIndex) => (
                <div
                  key={iIndex}
                  style={{ marginLeft: 20, display: "flex", alignItems: "center" }}
                >
                  <input
                    value={item.name}
                    onChange={(e) =>
                      renameItem(truck.id, bIndex, iIndex, e.target.value)
                    }
                  />

                  <button
                    onClick={() => deleteItem(truck.id, bIndex, iIndex)}
                    style={{ marginLeft: 10, color: "red" }}
                  >
                    Delete
                  </button>
                </div>
              ))}

            </div>
          ))}
        </div>
      ))}
    </div>
  );
}