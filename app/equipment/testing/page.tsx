"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import LogCard from "@/components/LogCard";
import LogSearch from "@/components/LogSearch";
import PageContainer from "@/components/PageContainer";

interface Equipment {
  id: string;
  name: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  assetNumber?: string;
  assignedTo?: string;
  location?: string;
  status?: string;
  inspectionInterval?: number;
  inspectionUnit?: string;
  notes?: string;
}

interface EquipmentLog {
  id: string;
  equipment: string;
  equipmentId?: string;
  equipmentType?: string;
  notes?: string;
  crew?: string[];
  procedureId?: string;
  procedureName?: string;
  overallResult?: string;
  steps?: any[];
  createdAt?: string;
}

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
}

interface Procedure {
  id: string;
  name: string;
  description: string;
}

interface ProcedureStep {
  id: string;
  procedureId: string;
  stepNumber: number;
  instruction: string;
}

interface ProcedureAssignment {
  id: string;
  equipmentId: string;
  procedureId: string;
}

export default function EquipmentTestingPage() {
  const router = useRouter();

  // --------------------------------------------------
  // EQUIPMENT
  // --------------------------------------------------

  const [equipment, setEquipment] =
    useState<Equipment[]>([]);

  const [selectedEquipment, setSelectedEquipment] =
    useState("");

  // --------------------------------------------------
  // PROCEDURES
  // --------------------------------------------------

  const [procedures, setProcedures] =
    useState<Procedure[]>([]);

  const [procedureSteps, setProcedureSteps] =
    useState<ProcedureStep[]>([]);

  const [procedureAssignments, setProcedureAssignments] =
    useState<ProcedureAssignment[]>([]);

  const [selectedProcedure, setSelectedProcedure] =
    useState("");

  const [stepResults, setStepResults] =
    useState<Record<string, "Pass" | "Fail" | "">>({});

  // --------------------------------------------------
  // LOGS
  // --------------------------------------------------

  const [logs, setLogs] =
    useState<EquipmentLog[]>([]);

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------

  const [users, setUsers] =
    useState<User[]>([]);

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const [notes, setNotes] =
    useState("");

  const [crew, setCrew] =
    useState<string[]>([]);

  const [crewOpen, setCrewOpen] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingLogId, setEditingLogId] =
    useState<string | null>(null);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const [search, setSearch] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  // --------------------------------------------------
  // PRINT
  // --------------------------------------------------

  const [forcePrint, setForcePrint] =
    useState(false);

  // --------------------------------------------------
  // LOAD EQUIPMENT FROM INVENTORY
  // --------------------------------------------------

  useEffect(() => {
    const unsub = onSnapshot(
      collection(
        db,
        "equipmentInventory"
      ),
      (snapshot) => {
        const data =
          snapshot.docs.map(
            (docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<
                Equipment,
                "id"
              >),
            })
          );

        // Don't show retired equipment
        const activeEquipment =
          data.filter(
            (item) =>
              item.status !==
              "Retired"
          );

        // Sort alphabetically
        activeEquipment.sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );

        setEquipment(
          activeEquipment
        );
      }
    );

    return () => unsub();
  }, []);

  // --------------------------------------------------
  // LOAD PROCEDURES
  // --------------------------------------------------

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "procedures"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Procedure, "id">),
        }));

        data.sort((a, b) => a.name.localeCompare(b.name));
        setProcedures(data);
      }
    );

    return () => unsub();
  }, []);

  // --------------------------------------------------
  // LOAD PROCEDURE STEPS
  // --------------------------------------------------

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "procedureSteps"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ProcedureStep, "id">),
        }));

        data.sort(
          (a, b) =>
            a.procedureId.localeCompare(b.procedureId) ||
            a.stepNumber - b.stepNumber
        );

        setProcedureSteps(data);
      }
    );

    return () => unsub();
  }, []);

  // --------------------------------------------------
  // LOAD PROCEDURE ASSIGNMENTS
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedEquipment) {
      setProcedureAssignments([]);
      return;
    }

    const assignmentsQuery = query(
      collection(db, "equipmentProcedureAssignments"),
      where("equipmentId", "==", selectedEquipment)
    );

    const unsub = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<
            ProcedureAssignment,
            "id"
          >),
        }));

        setProcedureAssignments(data);
      }
    );

    return () => unsub();
  }, [selectedEquipment]);

  // --------------------------------------------------
  // LOAD EQUIPMENT LOGS
  // --------------------------------------------------

  useEffect(() => {
    const unsub = onSnapshot(
      collection(
        db,
        "equipmentLogs"
      ),
      (snapshot) => {
        const data =
          snapshot.docs.map(
            (docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<
                EquipmentLog,
                "id"
              >),
            })
          );

        setLogs(data);
      }
    );

    return () => unsub();
  }, []);

  // --------------------------------------------------
  // LOAD USERS
  // --------------------------------------------------

  useEffect(() => {
    const loadUsers =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .select(
            "id, first_name, last_name"
          );

        if (error) {
          console.error(
            "Error loading users:",
            error
          );
          return;
        }

        setUsers(data || []);
      };

    loadUsers();
  }, []);

  // --------------------------------------------------
  // SELECT EQUIPMENT
  // --------------------------------------------------

  const handleSelectEquipment = (
    equipmentId: string
  ) => {
    setSelectedEquipment(equipmentId);
    setSelectedProcedure("");
    setStepResults({});
  };

  // --------------------------------------------------
  // PROCEDURE DATA
  // --------------------------------------------------

  const assignedProcedureIds = new Set(
    procedureAssignments.map(
      (assignment) => assignment.procedureId
    )
  );

  const assignedProcedures = procedures.filter(
    (procedure) => assignedProcedureIds.has(procedure.id)
  );

  const selectedProcedureData = procedures.find(
    (procedure) => procedure.id === selectedProcedure
  );

  const selectedProcedureSteps = procedureSteps
    .filter(
      (step) => step.procedureId === selectedProcedure
    )
    .sort((a, b) => a.stepNumber - b.stepNumber);

  // --------------------------------------------------
  // SAVE / UPDATE EQUIPMENT LOG
  // --------------------------------------------------

  const handleSubmit =
    async () => {
      if (!selectedEquipment) {
        alert(
          "Please select equipment."
        );
        return;
      }

      if (selectedProcedure && selectedProcedureSteps.length > 0) {
        const incomplete = selectedProcedureSteps.some(
          (step) => !stepResults[step.id]
        );

        if (incomplete) {
          alert(
            "Please mark Pass or Fail for every procedure step."
          );
          return;
        }
      }

      const selected =
        equipment.find(
          (item) =>
            item.id ===
            selectedEquipment
        );

      if (!selected) {
        alert(
          "The selected equipment could not be found."
        );
        return;
      }

      const logData = {
        equipment: selected.name,
        equipmentId: selected.id,
        equipmentType: selected.type || "",
        notes: notes || "",
        crew: crew || [],
        procedureId: selectedProcedure || "",
        procedureName: selectedProcedureData?.name || "",
        steps: selectedProcedureSteps.map((step) => ({
          id: step.id,
          name: step.instruction,
          checked: stepResults[step.id] === "Pass",
          result: stepResults[step.id] || "",
        })),
        overallResult:
          selectedProcedureSteps.length === 0
            ? ""
            : selectedProcedureSteps.some(
                (step) =>
                  stepResults[step.id] === "Fail"
              )
            ? "Fail"
            : "Pass",
      };

      try {
        if (editingLogId) {
          await updateDoc(
            doc(
              db,
              "equipmentLogs",
              editingLogId
            ),
            logData
          );
        } else {
          await addDoc(
            collection(
              db,
              "equipmentLogs"
            ),
            {
              ...logData,
              createdAt:
                new Date().toISOString(),
            }
          );
        }

        resetForm();
      } catch (error) {
        console.error(
          editingLogId
            ? "Error updating equipment check:"
            : "Error saving equipment check:",
          error
        );

        alert(
          editingLogId
            ? "Unable to update equipment check. Please try again."
            : "Unable to save equipment check. Please try again."
        );
      }
    };

  // --------------------------------------------------
  // DELETE LOG
  // --------------------------------------------------

  const deleteLog =
    async (
      id: string
    ) => {
      try {
        await deleteDoc(
          doc(
            db,
            "equipmentLogs",
            id
          )
        );
      } catch (error) {
        console.error(
          "Error deleting equipment log:",
          error
        );

        alert(
          "Unable to delete this equipment log."
        );
      }
    };

  // --------------------------------------------------
  // SORT LOGS
  // --------------------------------------------------

  const sortedLogs =
    [...logs].sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ).getTime() -
        new Date(
          a.createdAt || 0
        ).getTime()
    );

  // --------------------------------------------------
  // FILTER LOGS
  // --------------------------------------------------

  const filteredLogs =
    sortedLogs.filter(
      (log) => {
        const text =
          search
            .toLowerCase()
            .trim();

        const matchesSearch =
          !text ||
          log.equipment
            ?.toLowerCase()
            .includes(text) ||
          log.notes
            ?.toLowerCase()
            .includes(text) ||
          log.equipmentType
            ?.toLowerCase()
            .includes(text) ||
          log.crew
            ?.join(" ")
            .toLowerCase()
            .includes(text);

        const logTime =
          log.createdAt
            ? new Date(
                log.createdAt
              ).getTime()
            : 0;

        const start =
          startDate
            ? new Date(
                startDate +
                  "T00:00:00"
              ).getTime()
            : 0;

        const end =
          endDate
            ? new Date(
                endDate +
                  "T23:59:59"
              ).getTime()
            : Infinity;

        return (
          matchesSearch &&
          logTime >= start &&
          logTime <= end
        );
      }
    );

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  // --------------------------------------------------
  // EDIT LOG
  // --------------------------------------------------

  const handleEditLog = (log: EquipmentLog) => {
    setEditingLogId(log.id);
    setShowForm(true);
    setSelectedEquipment(log.equipmentId || "");
    setSelectedProcedure(log.procedureId || "");
    setNotes(log.notes || "");
    setCrew(log.crew || []);
    setCrewOpen(false);

    const results: Record<string, "Pass" | "Fail" | ""> = {};

    (log.steps || []).forEach((step: any) => {
      results[step.id] =
        step.result ||
        (step.checked ? "Pass" : "");
    });

    setStepResults(results);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  function resetForm() {
    setSelectedEquipment("");
    setSelectedProcedure("");
    setStepResults({});
    setNotes("");
    setCrew([]);
    setCrewOpen(false);
    setEditingLogId(null);
    setShowForm(false);
  }

  // --------------------------------------------------
  // PRINT
  // --------------------------------------------------

  function handlePrint() {
    setForcePrint(true);

    setTimeout(() => {
      window.print();
      setForcePrint(false);
    }, 200);
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <PageContainer
      title="Equipment Testing"
      subtitle="Perform equipment inspections and record testing results."
    >
      {/* ==========================================
          TOP BAR
      ========================================== */}

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
          className="btn btn-secondary"
          onClick={() =>
            router.push(
              "/equipment"
            )
          }
        >
          ← Equipment
        </button>

        <div
          style={{
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          {filteredLogs.length}{" "}
          Equipment Logs
        </div>
      </div>

      {/* ==========================================
          START BUTTON
      ========================================== */}

      {!showForm && (
        <button
          onClick={() =>
            setShowForm(true)
          }
          className="btn btn-success"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1rem",
            marginBottom: 20,
          }}
        >
          ➕ Start Equipment Check
        </button>
      )}

      {/* ==========================================
          FORM
      ========================================== */}

      {showForm && (
        <div
          className="card"
          style={{
            marginBottom: 30,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 20,
              color: "#991b1b",
            }}
          >
            {editingLogId
              ? "Edit Equipment Check"
              : "Equipment Check"}
          </h2>

          {/* EQUIPMENT SELECT */}

          <div
            style={{
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 6,
              }}
            >
              Equipment
            </div>

            <select
              value={
                selectedEquipment
              }
              onChange={(e) =>
                handleSelectEquipment(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 10,
                border:
                  "1px solid #ccc",
                borderRadius: 6,
                background:
                  "white",
              }}
            >
              <option value="">
                Select Equipment
              </option>

              {equipment.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                    {item.type
                      ? ` — ${item.type}`
                      : ""}
                  </option>
                )
              )}
            </select>

            {/* SELECTED EQUIPMENT INFORMATION */}

            {selectedEquipment && (
              <SelectedEquipmentInfo
                equipment={
                  equipment.find(
                    (item) =>
                      item.id ===
                      selectedEquipment
                  )
                }
              />
            )}

            {equipment.length ===
              0 && (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  background:
                    "#fff7ed",
                  border:
                    "1px solid #fed7aa",
                  borderRadius: 6,
                  color: "#9a3412",
                }}
              >
                No active equipment
                has been added to the
                equipment inventory.
              </div>
            )}
          </div>

          {/* TESTING PROCEDURE */}

          {selectedEquipment && (
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                Testing Procedure
              </div>

              {assignedProcedures.length === 0 ? (
                <div
                  style={{
                    padding: 12,
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: 6,
                    color: "#9a3412",
                  }}
                >
                  No testing procedures are assigned
                  to this equipment.
                </div>
              ) : (
                <>
                  <select
                    value={selectedProcedure}
                    onChange={(e) => {
                      setSelectedProcedure(e.target.value);
                      setStepResults({});
                    }}
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      background: "white",
                    }}
                  >
                    <option value="">
                      Select Testing Procedure
                    </option>

                    {assignedProcedures.map((procedure) => (
                      <option
                        key={procedure.id}
                        value={procedure.id}
                      >
                        {procedure.name}
                      </option>
                    ))}
                  </select>

                  {selectedProcedureData && (
                    <div style={{ marginTop: 16 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        {selectedProcedureData.name}
                      </div>

                      {selectedProcedureData.description && (
                        <div
                          style={{
                            color: "#666",
                            marginBottom: 14,
                          }}
                        >
                          {selectedProcedureData.description}
                        </div>
                      )}

                      {selectedProcedureSteps.length === 0 ? (
                        <div
                          style={{
                            padding: 12,
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: 6,
                            color: "#991b1b",
                          }}
                        >
                          This procedure has no testing
                          steps.
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              marginBottom: 12,
                              fontWeight: 600,
                              color: "#555",
                            }}
                          >
                            {
                              selectedProcedureSteps.filter(
                                (step) =>
                                  !!stepResults[step.id]
                              ).length
                            }{" "}
                            of {selectedProcedureSteps.length}{" "}
                            steps completed
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gap: 10,
                            }}
                          >
                            {selectedProcedureSteps.map((step) => {
                              const result =
                                stepResults[step.id] || "";

                              return (
                                <div
                                  key={step.id}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                      "1fr auto",
                                    gap: 16,
                                    alignItems: "center",
                                    padding: 14,
                                    border: "1px solid #ddd",
                                    borderRadius: 6,
                                    background: "white",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 10,
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <strong>
                                      {step.stepNumber}.
                                    </strong>

                                    <span>
                                      {step.instruction}
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setStepResults((prev) => ({
                                          ...prev,
                                          [step.id]: "Pass",
                                        }))
                                      }
                                      style={{
                                        padding: "10px 18px",
                                        borderRadius: 6,
                                        border:
                                          "1px solid #16a34a",
                                        background:
                                          result === "Pass"
                                            ? "#16a34a"
                                            : "white",
                                        color:
                                          result === "Pass"
                                            ? "white"
                                            : "#166534",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                      }}
                                    >
                                      Pass
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setStepResults((prev) => ({
                                          ...prev,
                                          [step.id]: "Fail",
                                        }))
                                      }
                                      style={{
                                        padding: "10px 18px",
                                        borderRadius: 6,
                                        border:
                                          "1px solid #dc2626",
                                        background:
                                          result === "Fail"
                                            ? "#dc2626"
                                            : "white",
                                        color:
                                          result === "Fail"
                                            ? "white"
                                            : "#991b1b",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                      }}
                                    >
                                      Fail
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* NOTES */}

          <div
            style={{
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 6,
              }}
            >
              Notes
            </div>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Enter testing notes..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: 10,
                border:
                  "1px solid #ccc",
                borderRadius: 6,
                resize: "vertical",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* CREW */}

          <div
            style={{
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={() =>
                setCrewOpen(
                  !crewOpen
                )
              }
              style={{
                width: "100%",
                padding: 10,
                background: "#eee",
                border:
                  "1px solid #ccc",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight:
                  "600",
              }}
            >
              👥 Crew (
              {crew.length})
              <span
                style={{
                  float: "right",
                }}
              >
                {crewOpen
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {crewOpen && (
              <div
                style={{
                  border:
                    "1px solid #ccc",
                  borderTop: "none",
                  padding: 12,
                  background:
                    "white",
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {users.length ===
                0 ? (
                  <div
                    style={{
                      color:
                        "#777",
                    }}
                  >
                    No users found.
                  </div>
                ) : (
                  users.map(
                    (u) => {
                      const name =
                        `${
                          u.first_name ||
                          ""
                        } ${
                          u.last_name ||
                          ""
                        }`.trim() ||
                        u.id;

                      const selected =
                        crew.includes(
                          name
                        );

                      return (
                        <div
                          key={
                            u.id
                          }
                          style={{
                            marginBottom:
                              8,
                          }}
                        >
                          <label
                            style={{
                              cursor:
                                "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                selected
                              }
                              onChange={() => {
                                setCrew(
                                  (
                                    prev
                                  ) =>
                                    selected
                                      ? prev.filter(
                                          (
                                            x
                                          ) =>
                                            x !==
                                            name
                                        )
                                      : [
                                          ...prev,
                                          name,
                                        ]
                                );
                              }}
                            />

                            {" "}

                            {name}
                          </label>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            )}
          </div>

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={
                handleSubmit
              }
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: 16,
              }}
              disabled={
                !selectedEquipment
              }
            >
              {editingLogId
                ? "💾 Update Check"
                : "💾 Save Check"}
            </button>

            <button
              type="button"
              onClick={
                resetForm
              }
              className="btn btn-secondary"
              style={{
                flex: 1,
                padding: 16,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          SEARCH
      ========================================== */}

      <LogSearch
        search={search}
        setSearch={setSearch}
        startDate={startDate}
        setStartDate={
          setStartDate
        }
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={() => {
          setSearch("");
          setStartDate("");
          setEndDate("");
        }}
        onPrint={
          handlePrint
        }
      />

      {/* ==========================================
          EQUIPMENT HISTORY
      ========================================== */}

      <h2
        style={{
          marginTop: 20,
          marginBottom: 20,
          color: "#991b1b",
        }}
      >
        Equipment History
      </h2>

      {filteredLogs.length ===
      0 ? (
        <div
          className="card"
          style={{
            textAlign:
              "center",
            padding: 40,
            color: "#6b7280",
          }}
        >
          No equipment testing
          records found.
        </div>
      ) : (
        filteredLogs.map(
          (log) => (
            <LogCard
              key={log.id}
              log={{
                ...log,

                truck:
                  log.equipment,

                bays: [
                  {
                    name: [
                      log.procedureName || "Equipment Test",
                      log.overallResult
                        ? `Overall: ${log.overallResult}`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" — "),

                    items:
                      log.steps?.map(
                        (
                          step: any
                        ) => ({
                          name:
                            step.name,

                          status:
                            step.result ||
                            (step.checked
                              ? "Pass"
                              : "Fail"),
                        })
                      ) || [],
                  },
                ],

                availableUsers:
                  users,
              }}
              onDelete={
                deleteLog
              }
              onEdit={
                handleEditLog
              }
              forcePrint={
                forcePrint
              }
            />
          )
        )
      )}

      {/* ==========================================
          PRINT CSS
      ========================================== */}

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }

          button,
          input,
          textarea,
          select {
            display: none !important;
          }

          .log-card {
            break-after: page;
            page-break-after: always;
            margin-bottom: 40px;
          }

          .log-details {
            display: block !important;
          }

          .no-print {
            display: none !important;
          }

          body.printing-single
            .log-card {
            display: none !important;
          }

          body.printing-single
            .print-single {
            display: block !important;
          }
        }
      `}</style>
    </PageContainer>
  );
}

// ==================================================
// SELECTED EQUIPMENT INFORMATION
// ==================================================

function SelectedEquipmentInfo({
  equipment,
}: {
  equipment?: Equipment;
}) {
  if (!equipment) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 10,
        padding: 12,
        background: "#f9fafb",
        border:
          "1px solid #e5e7eb",
        borderRadius: 6,
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(180px,1fr))",
        gap: 10,
        fontSize: 14,
      }}
    >
      <div>
        <strong>
          Type
        </strong>

        <br />

        {equipment.type ||
          "-"}
      </div>

      <div>
        <strong>
          Manufacturer
        </strong>

        <br />

        {equipment.manufacturer ||
          "-"}
      </div>

      <div>
        <strong>
          Model
        </strong>

        <br />

        {equipment.model ||
          "-"}
      </div>

      <div>
        <strong>
          Serial Number
        </strong>

        <br />

        {equipment.serialNumber ||
          "-"}
      </div>

      <div>
        <strong>
          Asset Number
        </strong>

        <br />

        {equipment.assetNumber ||
          "-"}
      </div>

      <div>
        <strong>
          Location
        </strong>

        <br />

        {equipment.location ||
          "-"}
      </div>
    </div>
  );
}