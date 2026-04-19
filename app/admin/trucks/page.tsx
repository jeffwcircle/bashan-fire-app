"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useRouter } from 'next/navigation'


import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc
} from "firebase/firestore";

type EquipmentItem = { name: string };

type Bay = {
  name: string;
  items: EquipmentItem[];
};

type Truck = {
  id: string;
  bays: Bay[];
};

export default function AdminPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [newTruckName, setNewTruckName] = useState("");

  const router = useRouter();

  // LOAD TRUCKS
  useEffect(() => {
    loadTrucks();
  }, []);

  const loadTrucks = async () => {
    const snap = await getDocs(collection(db, "truckTemplates"));

    const data: Truck[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any)
    }));

    setTrucks(data);
  };

  // CREATE TRUCK
  const createTruck = async () => {
    if (!newTruckName) return;

    await setDoc(doc(db, "truckTemplates", newTruckName), {
      bays: []
    });

    setNewTruckName("");
    loadTrucks();
  };

  // ADD BAY
  const addBay = async (truckId: string) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    const updated = {
      bays: [
        ...truck.bays,
        { name: "New Bay", items: [] }
      ]
    };

    await setDoc(doc(db, "truckTemplates", truckId), updated);
    loadTrucks();
  };

  // ADD ITEM
  const addItem = async (truckId: string, bayIndex: number) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[bayIndex].items.push({ name: "New Item" });

    await setDoc(doc(db, "truckTemplates", truckId), {
      bays
    });

    loadTrucks();
  };

  // DELETE TRUCK
  const deleteTruck = async (truckId: string) => {
    await deleteDoc(doc(db, "truckTemplates", truckId));
    loadTrucks();
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push("/")}>⬅ Back</button>
      <h1>🛠️ Truck Admin Panel</h1>
      {/* CREATE TRUCK */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="New Truck Name"
          value={newTruckName}
          onChange={(e) => setNewTruckName(e.target.value)}
        />
        <button onClick={createTruck}>Create Truck</button>
      </div>

      {/* TRUCK LIST */}
      {trucks.map(truck => (
        <div key={truck.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h3>
            {truck.id}
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
              <strong>{bay.name}</strong>

              <button onClick={() => addItem(truck.id, bIndex)} style={{ marginLeft: 10 }}>
                + Add Item
              </button>

              {/* ITEMS */}
              {bay.items?.map((item, iIndex) => (
                <div key={iIndex} style={{ marginLeft: 20 }}>
                  • {item.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}