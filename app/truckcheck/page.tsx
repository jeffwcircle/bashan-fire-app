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

type Status = "X" | "Pass" | "Fail";

type EquipmentItem = {
  name: string;
  status: Status;
};

type Bay = {
  name: string;
  items: EquipmentItem[];
};

type LogEntry = {
  id: string;
  date: string;
  truck: string;
  bays: Bay[];
  notes: string;
  crew: string[];
};

export default function TruckCheck() {
  const router = useRouter();

  const [templates, setTemplates] = useState<any>({});
  const [selectedTruck, setSelectedTruck] = useState("");
  const [bays, setBays] = useState<Bay[]>([]);
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState("");

  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editBays, setEditBays] = useState<Bay[]>([]);
  const [editNotes, setEditNotes] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [crewOpen, setCrewOpen] = useState(false);

  const [printTruck, setPrintTruck] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const truckNames = Object.keys(templates);

  // ---------------- LOAD LOGS ----------------
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

  // ---------------- LOAD TEMPLATES ----------------
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

  // ---------------- LOAD USERS ----------------
useEffect(() => {
  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles") // or "users" depending on your table name
      .select("id, first_name, last_name");

    if (error) {
      console.log("Crew load error:", error);
      return;
    }

    setUsers(data || []);
  };

  loadUsers();
}, []);

  // ---------------- TEMPLATE LOAD ----------------
  const handleTruckChange = (truck: string) => {
    setSelectedTruck(truck);

    const template = templates[truck];
    if (!template?.bays) return setBays([]);

    const copy: Bay[] = template.bays.map((bay: any) => ({
      name: bay.name,
      items: (bay.items || []).map((item: any) => ({
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
    status === "Pass" ? "green" : status === "Fail" ? "red" : "gray";

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    setError("");

    if (!selectedTruck) {
      setError("Please select a truck.");
      return;
    }

    await addDoc(collection(db, "truckLogs"), {
      date: new Date().toISOString(),
      truck: selectedTruck,
      bays,
      notes,
      crew: selectedCrew
    });

    setSelectedTruck("");
    setBays([]);
    setNotes("");
    setSelectedCrew([]);
    setCrewOpen(false);
  };

  // ---------------- DELETE ----------------
  const deleteLog = async (id: string) => {
    await deleteDoc(doc(db, "truckLogs", id));
  };

  // ---------------- EDIT ----------------
  const startEdit = (log: LogEntry) => {
    setEditingLogId(log.id);
    setEditBays(JSON.parse(JSON.stringify(log.bays)));
    setEditNotes(log.notes);
  };

  const toggleEditItem = (bIndex: number, iIndex: number) => {
    const updated = [...editBays];
    const current = updated[bIndex].items[iIndex].status;

    updated[bIndex].items[iIndex].status =
      current === "X"
        ? "Pass"
        : current === "Pass"
        ? "Fail"
        : "Pass";

    setEditBays(updated);
  };

  const saveEdit = async () => {
    if (!editingLogId) return;

    await updateDoc(doc(db, "truckLogs", editingLogId), {
      bays: editBays,
      notes: editNotes
    });

    setEditingLogId(null);
    setEditBays([]);
    setEditNotes("");
  };

  // ---------------- FILTER ----------------
// ---------------- FILTER ----------------
const filteredLogs = logs.filter((log) => {
  const matchTruck = !printTruck || log.truck === printTruck;

  // 🔥 SAFE DATE PARSE (prevents Invalid Date breaking filtering)
  const logTime = log.date ? new Date(log.date).getTime() : 0;

  const start = startDate ? new Date(startDate + "T00:00:00").getTime() : 0;
  const end = endDate ? new Date(endDate + "T23:59:59").getTime() : Infinity;

  const validDate = !isNaN(logTime);

  return matchTruck && validDate && logTime >= start && logTime <= end;
});

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push("/")}>⬅ Back</button>

      <h1>🚒 Truck Check System</h1>

      {/* TRUCK SELECT */}
      <h3>Select Truck</h3>

      <select
        value={selectedTruck}
        onChange={(e) => handleTruckChange(e.target.value)}
        style={{ padding: 8 }}
      >
        <option value="">-- Select Truck --</option>
        {truckNames.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

{/* ONLY SHOW CHECK FORM WHEN TRUCK IS SELECTED */}
{selectedTruck && (
  <>
    {/* BAYS */}
    {bays.map((bay, bIndex) => (
      <div key={bIndex} style={{ marginTop: 20 }}>
        <h3>📦 {bay.name}</h3>

        {bay.items.map((item, iIndex) => (
          <div key={iIndex}>
            {item.name}

            <button
              onClick={() => toggleItem(bIndex, iIndex)}
              style={{
                marginLeft: 10,
                backgroundColor: getColor(item.status),
                color: "white",
                border: "none",
                padding: "4px 10px",
                borderRadius: 5
              }}
            >
              {item.status}
            </button>
          </div>
        ))}
      </div>
    ))}

    {/* NOTES */}
    <h3 style={{ marginTop: 20 }}>Notes</h3>
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      style={{ width: "100%", height: 80 }}
    />

    {/* CREW */}
    <div style={{ marginTop: 20 }}>
      <button
        onClick={() => setCrewOpen(!crewOpen)}
        style={{
          padding: "10px",
          background: "#eee",
          borderRadius: 6,
          width: "100%"
        }}
      >
        👥 Crew Members {selectedCrew.length > 0 && `(${selectedCrew.length})`}
      </button>

      {crewOpen && (
        <div style={{ border: "1px solid #ccc", padding: 10 }}>
          {users.map((u) => {
            const name =
              `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.id;

            const isSelected = selectedCrew.includes(name);

            return (
              <div key={u.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      setSelectedCrew((prev) =>
                        isSelected
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

    {/* SUBMIT */}
    <button
      onClick={handleSubmit}
      style={{
        marginTop: 10,
        padding: "10px 20px",
        backgroundColor: "#1565c0",
        color: "white",
        border: "none",
        borderRadius: 5
      }}
    >
      Submit Check
    </button>
  </>
)}
      <hr style={{ margin: "30px 0" }} />


      {/* LOGS */}

{/* FILTER CONTROLS */}
<h3 style={{ marginTop: 20 }}>Filter Logs</h3>

<div>
  {/* Truck filter */}
  <select
    value={printTruck}
    onChange={(e) => setPrintTruck(e.target.value)}
  >
    <option value="">All Trucks</option>
    {truckNames.map((t) => (
      <option key={t} value={t}>
        {t}
      </option>
    ))}
  </select>

  {/* Date filters */}
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    style={{ marginLeft: 10 }}
  />

  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    style={{ marginLeft: 10 }}
  />

  {/* Reset button */}
  <button
    onClick={() => {
      setPrintTruck("");
      setStartDate("");
      setEndDate("");
    }}
    style={{ marginLeft: 10 }}
  >
    Reset
  </button>
</div>
<button
  onClick={() => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Truck Logs Print</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 10px; }
            .log { border-bottom: 1px solid #ccc; margin-bottom: 20px; padding-bottom: 10px; }
            .truck { font-size: 18px; font-weight: bold; }
            .section { margin-left: 10px; }
          </style>
        </head>
        <body>
          <h2>Truck Check Logs</h2>
          ${filteredLogs
            .map(
              (log) => `
              <div class="log">
                <div class="truck">${log.truck}</div>
                <div>${new Date(log.date).toLocaleString()}</div>

                ${log.bays
                  .map(
                    (bay) => `
                      <div class="section">
                        <strong>${bay.name}</strong>
                        ${bay.items
                          .map(
                            (item) =>
                              `<div>${item.name}: ${item.status}</div>`
                          )
                          .join("")}
                      </div>
                    `
                  )
                  .join("")}

                ${log.notes ? `<p><em>${log.notes}</em></p>` : ""}
                
                ${
                  log.crew?.length
                    ? `<p><strong>Crew:</strong> ${log.crew.join(", ")}</p>`
                    : ""
                }
              </div>
            `
            )
            .join("")}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }}
  style={{
    marginTop: 10,
    padding: "10px 20px",
    backgroundColor: "#444",
    color: "white",
    border: "none",
    borderRadius: 5
  }}
>
  🖨️ Print Filtered Logs
</button>
      <h2 style={{ marginTop: 30 }}>Previous Logs</h2>

      {filteredLogs.map((log) => (
        <div
          key={log.id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{log.truck}</strong>

            <div>
              <button onClick={() =>
                setExpandedLogId(expandedLogId === log.id ? null : log.id)
              }>
                View
              </button>

              <button onClick={() => startEdit(log)}>Edit</button>

              <button onClick={() => deleteLog(log.id)} style={{ color: "red" }}>
                Delete
              </button>

              <button
                onClick={() =>
                  window.open(`/truckcheck/print?id=${log.id}`, "_blank")
                }
              >
                Print
              </button>
            </div>
          </div>

          {/* ✅ VIEW RESTORED */}
          {expandedLogId === log.id && (
            <div style={{ marginTop: 10 }}>
              <p>{new Date(log.date).toLocaleString()}</p>

              {log.bays.map((bay, bIndex) => (
                <div key={bIndex}>
                  <h4>{bay.name}</h4>

                  {bay.items.map((item, iIndex) => (
                    <div key={iIndex}>
                      {item.name}: {item.status}
                    </div>
                  ))}
                </div>
              ))}

              {log.notes && <p><em>{log.notes}</em></p>}
{log.crew && log.crew.length > 0 && (
  <div style={{ marginTop: 10 }}>
    <strong>Crew:</strong>
    <ul style={{ margin: 0, paddingLeft: 20 }}>
      {log.crew.map((person, i) => (
        <li key={i}>{person}</li>
      ))}
    </ul>
  </div>
)}
            </div>
          )}

          {/* ✅ EDIT RESTORED */}
          {editingLogId === log.id && (
            <div style={{ marginTop: 10 }}>
              <h4>Edit Mode</h4>

              {editBays.map((bay, bIndex) => (
                <div key={bIndex}>
                  <h4>{bay.name}</h4>

                  {bay.items.map((item, iIndex) => (
                    <button
                      key={iIndex}
                      onClick={() => toggleEditItem(bIndex, iIndex)}
                      style={{
                        margin: 4,
                        backgroundColor: getColor(item.status),
                        color: "white",
                        border: "none",
                        padding: "4px 8px"
                      }}
                    >
                      {item.name}: {item.status}
                    </button>
                  ))}
                </div>
              ))}

              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                style={{ width: "100%", marginTop: 10 }}
              />

              <button onClick={saveEdit}>Save</button>

              <button
                onClick={() => setEditingLogId(null)}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}