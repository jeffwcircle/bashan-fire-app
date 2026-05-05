"use client";

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

type Status = "X" | "Pass" | "Fail";

export default function TruckCheck() {
  const router = useRouter();

  const [templates, setTemplates] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // ✅ NEW

  const [selectedTruck, setSelectedTruck] = useState("");
  const [bays, setBays] = useState<any[]>([]);
  const [notes, setNotes] = useState("");

  const [crew, setCrew] = useState<string[]>([]); // ✅ NEW
  const [crewOpen, setCrewOpen] = useState(false); // ✅ NEW

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const truckNames = Object.keys(templates);
const [forcePrint, setForcePrint] = useState(false)
  // LOAD LOGS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "truckLogs"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any)
      }));
      setLogs(data);
    });
    return () => unsub();
  }, []);

  // LOAD TEMPLATES
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "truckTemplates"), (snapshot) => {
      const data: any = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setTemplates(data);
    });
    return () => unsub();
  }, []);

  // 👤 LOAD USERS (NEW)
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name");

      setUsers(data || []);
    };

    loadUsers();
  }, []);

  const handleTruckChange = (truck: string) => {
    setSelectedTruck(truck);

    const template = templates[truck];
    if (!template?.bays) return setBays([]);

    const copy = template.bays.map((bay: any) => ({
      name: bay.name,
      items: bay.items.map((item: any) => ({
        name: item.name,
        status: "X"
      }))
    }));

    setBays(copy);
  };

  const toggleItem = (bIndex: number, iIndex: number) => {
    const updated = [...bays];
    const current = updated[bIndex].items[iIndex].status;

    updated[bIndex].items[iIndex].status =
      current === "X"
        ? "Pass"
        : current === "Pass"
        ? "Fail"
        : "Pass";

    setBays(updated);
  };

  const getColor = (status: Status) =>
    status === "Pass" ? "#2e7d32" :
    status === "Fail" ? "#c62828" :
    "#777";

  const handleSubmit = async () => {
    if (!selectedTruck) return alert("Select a truck");

    await addDoc(collection(db, "truckLogs"), {
      truck: selectedTruck,
      bays,
      notes,
      crew, // ✅ SAVE CREW
      createdAt: new Date().toISOString()
    });

    setSelectedTruck("");
    setBays([]);
    setNotes("");
    setCrew([]); // reset
  };

  const deleteLog = async (id: string) => {
    await deleteDoc(doc(db, "truckLogs", id));
  };

  const updateLog = async (updated: any) => {
    await updateDoc(doc(db, "truckLogs", updated.id), updated);
  };

  // SORT
  const sortedLogs = [...logs].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );

  // FILTER (UPDATED to include crew)
  const filteredLogs = sortedLogs.filter((log) => {
    const text = search.toLowerCase();

    const matchSearch =
      log.truck?.toLowerCase().includes(text) ||
      log.notes?.toLowerCase().includes(text) ||
      log.crew?.join(" ").toLowerCase().includes(text);

    const logTime = log.createdAt
      ? new Date(log.createdAt).getTime()
      : 0;

    const start = startDate
      ? new Date(startDate + "T00:00:00").getTime()
      : 0;

    const end = endDate
      ? new Date(endDate + "T23:59:59").getTime()
      : Infinity;

    return matchSearch && logTime >= start && logTime <= end;
  });

  return (
    <PageContainer>
      <button onClick={() => router.push("/")}>⬅ Back</button>

      <h1>🚒 Truck Check</h1>

      {/* SELECT TRUCK */}
      <select
        value={selectedTruck}
        onChange={(e) => handleTruckChange(e.target.value)}
        style={{ marginBottom: 10 }}
      >
        <option value="">Select Truck</option>
        {truckNames.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>

      {/* CHECK FORM */}
      {selectedTruck && (
        <div style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
          {bays.map((bay, bIndex) => (
            <div key={bIndex} style={{ marginTop: 15 }}>
              <h3>{bay.name}</h3>

              {bay.items.map((item: any, iIndex: number) => (
                <div
                  key={iIndex}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: "1px solid #ddd"
                  }}
                >
                  <span>{item.name}</span>

                  <button
                    onClick={() => toggleItem(bIndex, iIndex)}
                    style={{
                      minWidth: 80,
                      padding: "6px 10px",
                      backgroundColor: getColor(item.status),
                      color: "white",
                      border: "none",
                      borderRadius: 5
                    }}
                  >
                    {item.status}
                  </button>
                </div>
              ))}
            </div>
          ))}

          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: "100%", marginTop: 10 }}
          />

          {/* 👥 CREW SELECT (NEW) */}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setCrewOpen(!crewOpen)}
              style={{
                width: "100%",
                padding: 8,
                background: "#eee",
                borderRadius: 5
              }}
            >
              👥 Crew ({crew.length})
            </button>

            {crewOpen && (
              <div style={{ border: "1px solid #ccc", padding: 10 }}>
                {users.map((u) => {
                  const name =
                    `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.id;

                  const selected = crew.includes(name);

                  return (
                    <div key={u.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            setCrew((prev) =>
                              selected
                                ? prev.filter((x) => x !== name)
                                : [...prev, name]
                            );
                          }}
                        />
                        {" "}{name}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            style={{
              marginTop: 10,
              padding: "10px",
              background: "#1565c0",
              color: "white",
              borderRadius: 5,
              width: "100%"
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
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={() => {
          setSearch("");
          setStartDate("");
          setEndDate("");
        }}
  onPrint={() => {
    setForcePrint(true)
    setTimeout(() => {
      window.print()
      setForcePrint(false)
    }, 200)
  }}

      />
      {/* LOG LIST */}
      <h2 style={{ marginTop: 20 }}>Logs</h2>

      {filteredLogs.map((log) => (
        <LogCard
          key={log.id}
          log={{ ...log, availableUsers: users }} // ✅ IMPORTANT
          onDelete={deleteLog}
          onSaveEdit={updateLog}
          forcePrint={forcePrint}

        />
      ))}
<style jsx global>{`
  @media print {
    button,
    input,
    textarea,
    select {
      display: none !important;
    }

    body {
      background: white;
    }

    .log-details {
      display: block !important;
    }
  }
`}</style>

    </PageContainer>
  );
}