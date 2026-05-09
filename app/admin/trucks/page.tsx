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
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

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

  // ---------------- LOCAL UPDATE ----------------

  const updateTruckLocal = (truckId: string, updated: Truck) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === truckId ? updated : t))
    );
  };

  // ---------------- SAVE ----------------

  const saveTruck = async (truck: Truck) => {
    await setDoc(doc(db, "truckTemplates", truck.id), {
      bays: truck.bays
    });
  };

  // ---------------- CREATE ----------------

  const createTruck = async () => {
    if (!newTruck) return;

    await setDoc(doc(db, "truckTemplates", newTruck), {
      bays: []
    });

    setNewTruck("");
    load();
  };

  // ---------------- ADD BAY ----------------

  const addBay = (truckId: string) => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return;

    const updated: Truck = {
      ...truck,
      bays: [...(truck.bays || []), { name: "New Bay", items: [] }]
    };

    updateTruckLocal(truckId, updated);
  };

  // ---------------- RENAME BAY ----------------

  const renameBay = (truckId: string, index: number, name: string) => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[index].name = name;

    updateTruckLocal(truckId, { ...truck, bays });
  };

  // ---------------- DELETE BAY ----------------

  const deleteBay = (truckId: string, bayIndex: number) => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays.splice(bayIndex, 1);

    updateTruckLocal(truckId, { ...truck, bays });
  };

  // ---------------- ADD ITEM ----------------

  const addItem = (truckId: string, bayIndex: number) => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[bayIndex].items.push({ name: "" });

    updateTruckLocal(truckId, { ...truck, bays });
  };

  // ---------------- RENAME ITEM ----------------

  const renameItem = (
    truckId: string,
    bayIndex: number,
    itemIndex: number,
    name: string
  ) => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[bayIndex].items[itemIndex].name = name;

    updateTruckLocal(truckId, { ...truck, bays });
  };

  // ---------------- DELETE ITEM ----------------

  const deleteItem = (
    truckId: string,
    bayIndex: number,
    itemIndex: number
  ) => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return;

    const bays = [...truck.bays];
    bays[bayIndex].items.splice(itemIndex, 1);

    updateTruckLocal(truckId, { ...truck, bays });
  };

  // ---------------- DELETE TRUCK ----------------

  const deleteTruck = async (id: string) => {
    await deleteDoc(doc(db, "truckTemplates", id));
    load();
  };

  // ---------------- DRAG END ----------------

  const onDragEnd = (result: any, truck: Truck) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    // BAY DRAG
    if (type === "bay") {
      const newBays = [...truck.bays];

      const [moved] = newBays.splice(source.index, 1);

      newBays.splice(destination.index, 0, moved);

      updateTruckLocal(truck.id, {
        ...truck,
        bays: newBays
      });
    }

    // ITEM DRAG
    if (type === "item") {
      const newBays = [...truck.bays];

      const sourceBay = newBays[parseInt(source.droppableId)];
      const destBay = newBays[parseInt(destination.droppableId)];

      const [moved] = sourceBay.items.splice(source.index, 1);

      destBay.items.splice(destination.index, 0, moved);

      updateTruckLocal(truck.id, {
        ...truck,
        bays: newBays
      });
    }
  };

  // ---------------- UI ----------------

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push("./")}>⬅ Back</button>

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

      {/* TRUCKS */}
      {trucks.map((truck) => (
        <div
          key={truck.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: 20,
            padding: 15,
            borderRadius: 10
          }}
        >
          <h3>
            🚒 {truck.id}

            <button
              onClick={() => deleteTruck(truck.id)}
              style={{
                marginLeft: 10,
                color: "red"
              }}
            >
              Delete Truck
            </button>
          </h3>

          <button
            onClick={() => saveTruck(truck)}
            style={{ marginBottom: 10 }}
          >
            💾 Save Changes
          </button>

          <button onClick={() => addBay(truck.id)}>
            + Add Bay
          </button>

          <DragDropContext
            onDragEnd={(result) => onDragEnd(result, truck)}
          >
            {/* BAYS */}
            <Droppable
              droppableId="bays"
              direction="horizontal"
              type="bay"
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 15,
                    marginTop: 15
                  }}
                >
                  {truck.bays.map((bay, bIndex) => (
                    <Draggable
                      key={`bay-${bIndex}`}
                      draggableId={`bay-${bIndex}`}
                      index={bIndex}
                    >
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: 10,
                            padding: 10,
                            background: snapshot.isDragging
                              ? "#e3f2fd"
                              : "white",
                            boxShadow: snapshot.isDragging
                              ? "0 4px 12px rgba(0,0,0,0.2)"
                              : "none",
                            ...prov.draggableProps.style
                          }}
                        >
                          {/* DRAG HANDLE */}
                          <div
                            {...prov.dragHandleProps}
                            style={{
                              cursor: "grab",
                              fontSize: 18,
                              marginBottom: 8,
                              fontWeight: "bold",
                              color: "#555",
                              userSelect: "none"
                            }}
                          >
                            ☰ Drag Bay
                          </div>

                          {/* BAY NAME */}
                          <input
                            value={bay.name}
                            onChange={(e) =>
                              renameBay(
                                truck.id,
                                bIndex,
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              marginBottom: 8
                            }}
                          />

                          {/* BUTTONS */}
                          <div style={{ marginBottom: 10 }}>
                            <button
                              onClick={() =>
                                addItem(truck.id, bIndex)
                              }
                            >
                              + Add Item
                            </button>

                            <button
                              onClick={() =>
                                deleteBay(truck.id, bIndex)
                              }
                              style={{
                                marginLeft: 10,
                                color: "red"
                              }}
                            >
                              Delete Bay
                            </button>
                          </div>

                          {/* ITEMS */}
                          <Droppable
                            droppableId={`${bIndex}`}
                            type="item"
                          >
                            {(prov2) => (
                              <div
                                ref={prov2.innerRef}
                                {...prov2.droppableProps}
                              >
                                {bay.items.map((item, iIndex) => (
                                  <Draggable
                                    key={`item-${bIndex}-${iIndex}`}
                                    draggableId={`item-${bIndex}-${iIndex}`}
                                    index={iIndex}
                                  >
                                    {(prov3, snapshot3) => (
                                      <div
                                        ref={prov3.innerRef}
                                        {...prov3.draggableProps}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          marginBottom: 6,
                                          background:
                                            snapshot3.isDragging
                                              ? "#fff3e0"
                                              : "transparent",
                                          borderRadius: 6,
                                          padding: 4,
                                          ...prov3.draggableProps.style
                                        }}
                                      >
                                        {/* ITEM DRAG HANDLE */}
                                        <div
                                          {...prov3.dragHandleProps}
                                          style={{
                                            cursor: "grab",
                                            marginRight: 8,
                                            fontSize: 18,
                                            color: "#666",
                                            userSelect: "none"
                                          }}
                                        >
                                          ☰
                                        </div>

                                        <input
                                          value={item.name}
                                          placeholder="Item name"
                                          onChange={(e) =>
                                            renameItem(
                                              truck.id,
                                              bIndex,
                                              iIndex,
                                              e.target.value
                                            )
                                          }
                                          style={{
                                            flex: 1
                                          }}
                                        />

                                        <button
                                          onClick={() =>
                                            deleteItem(
                                              truck.id,
                                              bIndex,
                                              iIndex
                                            )
                                          }
                                          style={{
                                            marginLeft: 8,
                                            color: "red"
                                          }}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}

                                {prov2.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ))}
    </div>
  );
}