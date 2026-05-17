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

type Step = {
  name: string;
};

type Equipment = {
  id: string;
  name: string;
  procedure: string;
  steps: Step[];
};

export default function EquipmentAdminPage() {
  const router = useRouter();

  const [equipment, setEquipment] = useState<
    Equipment[]
  >([]);

  const [newEquipment, setNewEquipment] =
    useState("");

  // COLLAPSE STATE
  const [openItems, setOpenItems] =
    useState<Record<string, boolean>>(
      {}
    );

  // LOAD
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const snap = await getDocs(
      collection(db, "equipmentTemplates")
    );

    const data: Equipment[] =
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any)
      }));

    setEquipment(data);
  };

  // LOCAL UPDATE
  const updateLocal = (
    id: string,
    updated: Equipment
  ) => {
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === id ? updated : e
      )
    );
  };

  // SAVE
  const saveEquipment = async (
    item: Equipment
  ) => {
    await setDoc(
      doc(
        db,
        "equipmentTemplates",
        item.id
      ),
      {
        name: item.name,
        procedure: item.procedure,
        steps: item.steps
      }
    );

    alert("Saved");
  };

  // CREATE
  const createEquipment = async () => {
    if (!newEquipment.trim()) return;

    await setDoc(
      doc(
        db,
        "equipmentTemplates",
        newEquipment
      ),
      {
        name: newEquipment,
        procedure: "",
        steps: []
      }
    );

    setNewEquipment("");

    load();
  };

  // DELETE
  const deleteEquipment = async (
    id: string
  ) => {
    const confirmed = confirm(
      "Delete this equipment?"
    );

    if (!confirmed) return;

    await deleteDoc(
      doc(
        db,
        "equipmentTemplates",
        id
      )
    );

    load();
  };

  // UPDATE FIELD
  const updateField = (
    id: string,
    field: string,
    value: any
  ) => {
    const item = equipment.find(
      (e) => e.id === id
    );

    if (!item) return;

    updateLocal(id, {
      ...item,
      [field]: value
    });
  };

  // ADD STEP
  const addStep = (id: string) => {
    const item = equipment.find(
      (e) => e.id === id
    );

    if (!item) return;

    updateLocal(id, {
      ...item,
      steps: [
        ...(item.steps || []),
        {
          name: ""
        }
      ]
    });
  };

  // UPDATE STEP
  const updateStep = (
    id: string,
    index: number,
    value: string
  ) => {
    const item = equipment.find(
      (e) => e.id === id
    );

    if (!item) return;

    const updatedSteps = [
      ...(item.steps || [])
    ];

    updatedSteps[index].name = value;

    updateLocal(id, {
      ...item,
      steps: updatedSteps
    });
  };

  // DELETE STEP
  const deleteStep = (
    id: string,
    index: number
  ) => {
    const item = equipment.find(
      (e) => e.id === id
    );

    if (!item) return;

    const updatedSteps = [
      ...(item.steps || [])
    ];

    updatedSteps.splice(index, 1);

    updateLocal(id, {
      ...item,
      steps: updatedSteps
    });
  };

  return (
    <div style={{ padding: 20 }}>
      {/* BACK */}
      <button
        onClick={() =>
          router.push("/")
        }
      >
        ⬅ Back
      </button>

      <h1>
        🧰 Equipment Admin
      </h1>

      {/* CREATE */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 10,
          flexWrap: "wrap"
        }}
      >
        <input
          value={newEquipment}
          placeholder="New Equipment Name"
          onChange={(e) =>
            setNewEquipment(
              e.target.value
            )
          }
          style={{
            flex: 1,
            minWidth: 250
          }}
        />

        <button
          onClick={
            createEquipment
          }
        >
          ➕ Create
        </button>
      </div>

      {/* EQUIPMENT LIST */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}
      >
        {equipment.map((item) => {
          const open =
            openItems[item.id] ||
            false;

          return (
            <div
              key={item.id}
              style={{
                border:
                  "1px solid #ccc",
                borderRadius: 10,
                overflow:
                  "hidden",
                background:
                  "white"
              }}
            >
              {/* HEADER */}
              <div
                onClick={() =>
                  setOpenItems(
                    (prev) => ({
                      ...prev,
                      [item.id]:
                        !prev[
                          item.id
                        ]
                    })
                  )
                }
                style={{
                  background:
                    "#f5f5f5",
                  padding: 15,
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  cursor:
                    "pointer",
                  gap: 10,
                  flexWrap:
                    "wrap"
                }}
              >
                <div
                  style={{
                    fontWeight:
                      "bold",
                    fontSize: 18
                  }}
                >
                  {open
                    ? "🔽"
                    : "▶"}{" "}
                  {item.name}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    deleteEquipment(
                      item.id
                    );
                  }}
                  style={{
                    color: "red"
                  }}
                >
                  Delete
                </button>
              </div>

              {/* CONTENT */}
              {open && (
                <div
                  style={{
                    padding: 15
                  }}
                >
                  {/* NAME */}
                  <div
                    style={{
                      marginBottom: 15
                    }}
                  >
                    <div
                      style={{
                        fontWeight:
                          "bold",
                        marginBottom: 5
                      }}
                    >
                      Equipment Name
                    </div>

                    <input
                      value={
                        item.name ||
                        ""
                      }
                      onChange={(
                        e
                      ) =>
                        updateField(
                          item.id,
                          "name",
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",
                        padding: 8
                      }}
                    />
                  </div>

                  {/* PROCEDURE */}
                  <div
                    style={{
                      marginBottom: 15
                    }}
                  >
                    <div
                      style={{
                        fontWeight:
                          "bold",
                        marginBottom: 5
                      }}
                    >
                      Testing
                      Procedure
                    </div>

                    <textarea
                      value={
                        item.procedure ||
                        ""
                      }
                      onChange={(
                        e
                      ) =>
                        updateField(
                          item.id,
                          "procedure",
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",
                        minHeight: 120,
                        padding: 8
                      }}
                    />
                  </div>

                  {/* STEPS */}
                  <div>
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom: 10
                      }}
                    >
                      <strong>
                        Testing
                        Steps
                      </strong>

                      <button
                        onClick={() =>
                          addStep(
                            item.id
                          )
                        }
                      >
                        ➕ Add
                        Step
                      </button>
                    </div>

                    {(item.steps ||
                      []).map(
                      (
                        step,
                        index
                      ) => (
                        <div
                          key={
                            index
                          }
                          style={{
                            display:
                              "flex",
                            gap: 10,
                            marginBottom: 10,
                            alignItems:
                              "center"
                          }}
                        >
                          <input
                            value={
                              step.name ||
                              ""
                            }
                            placeholder={`Step ${
                              index +
                              1
                            }`}
                            onChange={(
                              e
                            ) =>
                              updateStep(
                                item.id,
                                index,
                                e
                                  .target
                                  .value
                              )
                            }
                            style={{
                              flex: 1,
                              padding: 8
                            }}
                          />

                          <button
                            onClick={() =>
                              deleteStep(
                                item.id,
                                index
                              )
                            }
                            style={{
                              color:
                                "red"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {/* SAVE */}
                  <button
                    onClick={() =>
                      saveEquipment(
                        item
                      )
                    }
                    style={{
                      marginTop: 15,
                      width:
                        "100%",
                      padding: 12,
                      background:
                        "#1565c0",
                      color:
                        "white",
                      borderRadius: 6
                    }}
                  >
                    💾 Save
                    Equipment
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}