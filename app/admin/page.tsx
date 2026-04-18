"use client";

import { useState } from "react";
import { useTruckTemplates } from "@/data/useTruckTemplates";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { templates, setTemplates } = useTruckTemplates();

  const [selectedTruck, setSelectedTruck] = useState("");
  const [newTruck, setNewTruck] = useState("");

  const [newBay, setNewBay] = useState("");
  const [newItem, setNewItem] = useState("");

  const update = (data: any) => setTemplates(data);

  <button onClick={() => router.push("/")}>⬅ Back</button>

  // CREATE TRUCK
  const addTruck = () => {
    if (!newTruck) return;

    update({
      ...templates,
      [newTruck]: {
        name: newTruck,
        bays: []
      }
    });

    setNewTruck("");
  };

  // ADD BAY
  const addBay = () => {
    if (!selectedTruck || !newBay) return;

    const updated = { ...templates };

    updated[selectedTruck].bays.push({
      name: newBay,
      items: []
    });

    update(updated);
    setNewBay("");
  };

  // ADD ITEM
  const addItem = (bayIndex: number) => {
    if (!newItem) return;

    const updated = { ...templates };

    updated[selectedTruck].bays[bayIndex].items.push({
      name: newItem
    });

    update(updated);
    setNewItem("");
  };

  // DELETE ITEM
  const deleteItem = (bIndex: number, iIndex: number) => {
    const updated = { ...templates };

    updated[selectedTruck].bays[bIndex].items.splice(iIndex, 1);

    update(updated);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🧩 Truck Template Builder</h1>

      {/* CREATE TRUCK */}
      <h3>Create Truck</h3>
      <input
        value={newTruck}
        onChange={(e) => setNewTruck(e.target.value)}
        placeholder="Engine 3"
      />
      <button onClick={addTruck}>Add Truck</button>

      {/* SELECT TRUCK */}
      <h3>Select Truck</h3>
      <select
        value={selectedTruck}
        onChange={(e) => setSelectedTruck(e.target.value)}
      >
        <option value="">-- Select --</option>
        {Object.keys(templates).map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* ADD BAY */}
      {selectedTruck && (
        <>
          <h3>Add Bay</h3>
          <input
            value={newBay}
            onChange={(e) => setNewBay(e.target.value)}
            placeholder="Front Cab"
          />
          <button onClick={addBay}>Add Bay</button>

          {/* TEMPLATE VIEW */}
          <h2 style={{ marginTop: 20 }}>Template Editor</h2>

          {templates[selectedTruck]?.bays.map((bay, bIndex) => (
            <div key={bIndex} style={{ marginBottom: 20 }}>
              <h3>📦 {bay.name}</h3>

              {bay.items.map((item, iIndex) => (
                <div key={iIndex}>
                  {item.name}

                  <button
                    onClick={() => deleteItem(bIndex, iIndex)}
                    style={{ marginLeft: 10, color: "red" }}
                  >
                    Delete
                  </button>
                </div>
              ))}

              {/* ADD ITEM */}
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add equipment"
              />

              <button onClick={() => addItem(bIndex)}>
                Add Item
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}