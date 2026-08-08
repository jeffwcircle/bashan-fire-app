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
  updateDoc,
} from "firebase/firestore";

import { supabase } from "@/lib/supabase";

import LogCard from "@/components/LogCard";
import LogSearch from "@/components/LogSearch";
import PageContainer from "@/components/PageContainer";

type Status = "X" | "Pass" | "Fail";

export default function TruckCheck() {
  const [templates, setTemplates] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [selectedTruck, setSelectedTruck] =
    useState("");

  const [bays, setBays] = useState<any[]>([]);

  const [notes, setNotes] = useState("");

  const [crew, setCrew] = useState<string[]>(
    []
  );

  const [crewOpen, setCrewOpen] =
    useState(false);

  // COLLAPSE STATE
  const [openBays, setOpenBays] =
    useState<Record<string, boolean>>({});

  const [search, setSearch] = useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const truckNames = Object.keys(templates);

  const [forcePrint, setForcePrint] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  // LOAD LOGS
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "truckLogs"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        setLogs(data);
      }
    );

    return () => unsub();
  }, []);

  // LOAD TEMPLATES
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "truckTemplates"),
      (snapshot) => {
        const data: any = {};

        snapshot.forEach((doc) => {
          data[doc.id] = doc.data();
        });

        setTemplates(data);
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

  // HANDLE TRUCK
  const handleTruckChange = (
    truck: string
  ) => {
    setSelectedTruck(truck);

    const template = templates[truck];

    if (!template?.bays)
      return setBays([]);

    const copy = template.bays.map(
      (bay: any) => ({
        name: bay.name,
        items: bay.items.map(
          (item: any) => ({
            name: item.name,
            status: "X",
          })
        ),
      })
    );

    setBays(copy);

    // COLLAPSE ALL BY DEFAULT
    const collapsed: Record<
      string,
      boolean
    > = {};

    copy.forEach(
      (_: any, index: number) => {
        collapsed[index] = false;
      }
    );

    setOpenBays(collapsed);
  };

  // TOGGLE ITEM
  const toggleItem = (
    bIndex: number,
    iIndex: number
  ) => {
    const updated = [...bays];

    const current =
      updated[bIndex].items[iIndex]
        .status;

    updated[bIndex].items[iIndex].status =
      current === "X"
        ? "Pass"
        : current === "Pass"
        ? "Fail"
        : "Pass";

    setBays(updated);
  };

  // STATUS COLOR
  const getColor = (status: Status) =>
    status === "Pass"
      ? "#2e7d32"
      : status === "Fail"
      ? "#c62828"
      : "#777";

  // SAVE LOG
  const handleSubmit = async () => {
    if (!selectedTruck)
      return alert("Select a truck");

    await addDoc(
      collection(db, "truckLogs"),
      {
        truck: selectedTruck,
        bays,
        notes,
        crew,
        createdAt:
          new Date().toISOString(),
      }
    );

    setSelectedTruck("");
    setBays([]);
    setNotes("");
    setCrew([]);
    setShowForm(false);
  };

  // DELETE
  const deleteLog = async (
    id: string
  ) => {
    await deleteDoc(
      doc(db, "truckLogs", id)
    );
  };

  // UPDATE
  const updateLog = async (
    updated: any
  ) => {
    await updateDoc(
      doc(db, "truckLogs", updated.id),
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

      const matchSearch =
        log.truck
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
        matchSearch &&
        logTime >= start &&
        logTime <= end
      );
    });

  return (
    <RequirePermission permission="truck_checks">
      <PageContainer
        title="Truck Check Logs"
        subtitle="Complete monthly apparatus inspections and review previous reports."
      >
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
            className="btn btn-success"
            onClick={() => {
              setShowForm(!showForm);

              if (!showForm) {
                setSelectedTruck("");
                setBays([]);
              }
            }}
            style={{
              width: "100%",
              marginTop: 20,
              padding: "16px",
              fontSize: "1rem",
            }}
          >
            {showForm
              ? "Cancel"
              : "➕ Start Truck Check Log"}
          </button>
        </div>

        {/* SELECT */}
        {showForm && (
          <select
            className="shadow-hover"
            value={selectedTruck}
            onChange={(e) =>
              handleTruckChange(
                e.target.value
              )
            }
            style={{
              marginBottom: 10,
            }}
          >
            <option value="">
              Select Truck
            </option>

            {truckNames.map((t) => (
              <option key={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        {/* FORM */}
        {showForm && selectedTruck && (
          <div
            className="card"
            style={{
              marginTop: 20,
            }}
          >
            {bays.map(
              (bay, bIndex) => {
                // CHECK STATUS
                const checkedCount =
                  bay.items.filter(
                    (i: any) =>
                      i.status !== "X"
                  ).length;

                const total =
                  bay.items.length;

                const complete =
                  total > 0 &&
                  checkedCount === total;

                const bayOpen =
                  openBays[bIndex] ||
                  false;

                return (
                  <div
                    key={bIndex}
                    style={{
                      marginTop: 15,
                      border:
                        "1px solid #d6dbe3",
                      borderRadius: 8,
                      overflow:
                        "hidden",
                    }}
                  >
                    {/* HEADER */}
                    <div
                      onClick={() =>
                        setOpenBays(
                          (prev) => ({
                            ...prev,
                            [bIndex]:
                              !prev[
                                bIndex
                              ],
                          })
                        )
                      }
                      style={{
                        background: complete
                          ? "#dcfce7"
                          : "#ffffff",
                        padding: 12,
                        cursor:
                          "pointer",
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                      }}
                    >
                      <div
                        style={{
                          fontWeight:
                            "bold",
                          fontSize: 18,
                        }}
                      >
                        {bayOpen
                          ? "🔽"
                          : "▶"}{" "}
                        {bay.name}
                      </div>

                      <div
                        style={{
                          fontWeight:
                            "bold",
                          color:
                            complete
                              ? "#2e7d32"
                              : "#666",
                        }}
                      >
                        {checkedCount}/
                        {total}

                        {complete &&
                          " ✅"}
                      </div>
                    </div>

                    {/* CONTENT */}
                    {bayOpen && (
                      <div
                        style={{
                          padding: 10,
                        }}
                      >
                        {bay.items.map(
                          (
                            item: any,
                            iIndex: number
                          ) => (
                            <div
                              key={
                                iIndex
                              }
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                alignItems:
                                  "center",
                                padding:
                                  "6px 0",
                                borderBottom:
                                  "1px solid #ddd",
                              }}
                            >
                              <span>
                                {
                                  item.name
                                }
                              </span>

                              <button
                                onClick={() =>
                                  toggleItem(
                                    bIndex,
                                    iIndex
                                  )
                                }
                                style={{
                                  minWidth: 95,
                                  padding:
                                    "6px 10px",
                                  backgroundColor:
                                    getColor(
                                      item.status
                                    ),
                                  color:
                                    "white",
                                  border:
                                    "none",
                                  borderRadius: 5,
                                }}
                              >
                                {
                                  item.status
                                }
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}

            {/* NOTES */}
            <textarea
              rows={5}
              placeholder="Notes"
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                marginTop: 10,
              }}
            />

            {/* CREW */}
            <div
              style={{
                marginTop: 10,
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
                  padding: 8,
                  background: "#eee",
                  borderRadius: 5,
                }}
              >
                👥 Crew (
                {crew.length})
              </button>

              {crewOpen && (
                <div
                  style={{
                    border:
                      "1px solid #ccc",
                    padding: 10,
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
                  })}
                </div>
              )}
            </div>

            {/* SUBMIT */}
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              style={{
                marginTop: 24,
                width: "100%",
                padding: "16px",
                fontSize: "1.05rem",
              }}
            >
              Submit Check
            </button>
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
            marginTop: 20,
          }}
        >
          Logs
        </h2>

        {filteredLogs.map((log) => (
          <LogCard
            key={log.id}
            log={{
              ...log,
              availableUsers:
                users,
            }}
            onDelete={(id: string) => {
              deleteLog(id);
            }}
            onSaveEdit={(log: any) => {
              updateLog(log);
            }}
            forcePrint={forcePrint}
          />
        ))}

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

            /* NORMAL LOG PRINT */
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

            /* SINGLE LOG PRINT MODE */
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
    </RequirePermission>
  );
}