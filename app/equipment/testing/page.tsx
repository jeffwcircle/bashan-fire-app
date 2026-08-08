"use client";

import RequirePermission from "@/components/auth/RequirePermission";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import LogCard from "@/components/LogCard";
import LogSearch from "@/components/LogSearch";
import PageContainer from "@/components/PageContainer";

export default function EquipmentTestingPage() {
  const router = useRouter();

  const [templates, setTemplates] =
    useState<any[]>([]);

  const [logs, setLogs] = useState<any[]>(
    []
  );

  const [users, setUsers] = useState<any[]>(
    []
  );

  const [selectedEquipment, setSelectedEquipment] =
    useState("");

  const [procedure, setProcedure] =
    useState("");

  const [steps, setSteps] = useState<any[]>(
    []
  );

  const [notes, setNotes] = useState("");

  const [crew, setCrew] = useState<string[]>(
    []
  );

  const [crewOpen, setCrewOpen] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  // SEARCH
  const [search, setSearch] = useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  // PRINT
  const [forcePrint, setForcePrint] =
    useState(false);

  // LOAD EQUIPMENT TEMPLATES
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "equipmentTemplates"),
      (snapshot) => {
        const data = snapshot.docs.map(
          (d) => ({
            id: d.id,
            ...(d.data() as any)
          })
        );

        setTemplates(data);
      }
    );

    return () => unsub();
  }, []);

  // LOAD LOGS
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "equipmentLogs"),
      (snapshot) => {
        const data = snapshot.docs.map(
          (d) => ({
            id: d.id,
            ...(d.data() as any)
          })
        );

        setLogs(data);
      }
    );

    return () => unsub();
  }, []);

  // LOAD USERS
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name"
        );

      setUsers(data || []);
    };

    loadUsers();
  }, []);

  // SELECT EQUIPMENT
  const handleSelectEquipment = (
    equipmentId: string
  ) => {
    setSelectedEquipment(equipmentId);

    const equipment = templates.find(
      (t) => t.id === equipmentId
    );

    if (!equipment) return;

    setProcedure(
      equipment.procedure || ""
    );

    setSteps(
      (equipment.steps || []).map(
        (step: any) => ({
          name: step.name,
          checked: false
        })
      )
    );
  };

  // TOGGLE STEP
  const toggleStep = (index: number) => {
    const updated = [...steps];

    updated[index].checked =
      !updated[index].checked;

    setSteps(updated);
  };

  // SAVE LOG
  const handleSubmit = async () => {
    if (!selectedEquipment)
      return alert(
        "Select equipment"
      );

    await addDoc(
      collection(db, "equipmentLogs"),
      {
        equipment:
          selectedEquipment,
        procedure,
        steps,
        notes,
        crew,
        createdAt:
          new Date().toISOString()
      }
    );

    // RESET
    setSelectedEquipment("");
    setProcedure("");
    setSteps([]);
    setNotes("");
    setCrew([]);
    setShowForm(false);
  };

  // DELETE LOG
  const deleteLog = async (
    id: string
  ) => {
    await deleteDoc(
      doc(db, "equipmentLogs", id)
    );
  };

  // UPDATE LOG
  const updateLog = async (
    updated: any
  ) => {
    await updateDoc(
      doc(
        db,
        "equipmentLogs",
        updated.id
      ),
      updated
    );
  };

  // SORT
  const sortedLogs = [...logs].sort(
    (a, b) =>
      new Date(
        b.createdAt || 0
      ).getTime() -
      new Date(
        a.createdAt || 0
      ).getTime()
  );

  // FILTER
  const filteredLogs =
    sortedLogs.filter((log) => {
      const text =
        search.toLowerCase();

      const matchesSearch =
        log.equipment
          ?.toLowerCase()
          .includes(text) ||
        log.notes
          ?.toLowerCase()
          .includes(text) ||
        log.crew
          ?.join(" ")
          .toLowerCase()
          .includes(text);

      const logTime = log.createdAt
        ? new Date(
            log.createdAt
          ).getTime()
        : 0;

      const start = startDate
        ? new Date(
            startDate +
              "T00:00:00"
          ).getTime()
        : 0;

      const end = endDate
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
    });

  return (
 <RequirePermission permission="equipment">
<PageContainer
  title="Equipment Testing"
  subtitle="Perform equipment inspections and record testing results."
>
      {/* BACK */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  }}
>
  <button
    className="btn btn-secondary"
    onClick={() => router.push("/")}
  >
    ← Dashboard
  </button>

  <div
    style={{
      color: "#6b7280",
      fontWeight: 600,
    }}
  >
    {filteredLogs.length} Equipment Logs
  </div>
</div>
      {/* START BUTTON */}
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
}}        >
          ➕ Start Equipment Check
        </button>
      )}

      {/* FORM */}
      {showForm && (
<div
  className="card"
  style={{
    marginBottom: 30,
  }}
>          {/* SELECT */}
          <div
            style={{
              marginBottom: 15
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 5
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
                padding: 10
              }}
            >
              <option value="">
                Select Equipment
              </option>

              {templates.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PROCEDURE */}
          {procedure && (
            <div
              style={{
                marginBottom: 20
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 5
                }}
              >
                Testing Procedure
              </div>

              <div
                style={{
                  background: "white",
                  padding: 12,
                  borderRadius: 6,
border:
  "1px solid #dbe3eb",
                  whiteSpace:
                    "pre-wrap"
                }}
              >
                {procedure}
              </div>
            </div>
          )}

          {/* STEPS */}
          {steps.length > 0 && (
            <div
              style={{
                marginBottom: 20
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 10
                }}
              >
                Testing Steps
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: 10
                }}
              >
                {steps.map(
                  (
                    step,
                    index
                  ) => (
                    <div
                      key={index}
                      onClick={() =>
                        toggleStep(
                          index
                        )
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 10,
background:
  step.checked
    ? "#dcfce7"
    : "#ffffff",
                        border:
  "1px solid #dbe3eb",
                        padding: 12,
                        borderRadius: 8,
                        cursor:
                          "pointer"
                      }}
                    >
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight:
                            "bold",
                          color:
                            step.checked
                              ? "green"
                              : "#777"
                        }}
                      >
                        {step.checked
                          ? "✅"
                          : "⬜"}
                      </div>

                      <div
                        style={{
                          fontSize: 16
                        }}
                      >
                        {
                          step.name
                        }
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* NOTES */}
          <div
            style={{
              marginBottom: 15
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 5
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
              style={{
                width: "100%",
                minHeight: 100,
                padding: 10
              }}
            />
          </div>

          {/* CREW */}
          <div
            style={{
              marginBottom: 15
            }}
          >
            <button
              onClick={() =>
                setCrewOpen(
                  !crewOpen
                )
              }
              style={{
                width: "100%",
                padding: 10,
                background: "#f3f4f6",
                borderRadius: 6
              }}
            >
              👥 Crew (
              {crew.length})
            </button>

            {crewOpen && (
              <div
                style={{
                  border:
                    "1px solid #dbe3eb",
                  padding: 10,
                  background:
                    "white"
                }}
              >
                {users.map((u) => {
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
                      key={u.id}
                      style={{
                        marginBottom: 6
                      }}
                    >
                      <label>
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
                                      name
                                    ]
                            );
                          }}
                        />

                        {" "}
                        {name}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={
                handleSubmit
              }
className="btn btn-primary"
style={{
  flex: 1,
  padding: 16,
}}
            >
              💾 Save Check
            </button>

            <button
              onClick={() => {
                setShowForm(
                  false
                );

                setSelectedEquipment(
                  ""
                );

                setProcedure(
                  ""
                );

                setSteps([]);

                setNotes("");

                setCrew([]);
              }}
className="btn btn-secondary"
style={{
  flex: 1,
}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
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
        onPrint={() => {
          setForcePrint(true);

          setTimeout(() => {
            window.print();

            setForcePrint(false);
          }, 200);
        }}
      />

      {/* LOGS */}
<h2
  style={{
    marginTop: 10,
    marginBottom: 20,
    color: "#991b1b",
  }}
>
  Equipment History
</h2>

      {filteredLogs.map((log) => (
        <LogCard
          key={log.id}
          log={{
            ...log,
            truck:
              log.equipment,
            bays: [
              {
                name:
                  "Testing Steps",
                items:
                  log.steps?.map(
                    (
                      step: any
                    ) => ({
                      name:
                        step.name,
                      status:
                        step.checked
                          ? "Pass"
                          : "Fail"
                    })
                  ) || [],
              },
            ],
            availableUsers:
              users
          }}
          onDelete={deleteLog}
          onSaveEdit={updateLog}
          forcePrint={
            forcePrint
          }
        />
      ))}

      {/* PRINT CSS */}
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

          body.printing-single .log-card {
            display: none !important;
          }

          body.printing-single .print-single {
            display: block !important;
          }
        }
      `}</style>
    </PageContainer>
  </RequirePermission>
  );
}