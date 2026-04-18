"use client";

import { useEffect, useState } from "react";
import { useTruckTemplates } from "@/data/useTruckTemplates";

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
  id: number;
  date: string;
  truck: string;
  bays: Bay[];
  notes: string;
};

export default function TruckCheck() {
  const { templates } = useTruckTemplates();

  const truckNames = Object.keys(templates);

  const [selectedTruck, setSelectedTruck] = useState("");
  const [bays, setBays] = useState<Bay[]>([]);
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState("");

  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editBays, setEditBays] = useState<Bay[]>([]);
  const [editNotes, setEditNotes] = useState("");

  // Load logs
  useEffect(() => {
    const saved = localStorage.getItem("truckLogs");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  // -----------------------------
  // LOAD TEMPLATE FROM ADMIN
  // -----------------------------
  const handleTruckChange = (truck: string) => {
    setSelectedTruck(truck);

    const template = templates[truck];

    if (!template) {
      setBays([]);
      return;
    }

    const copy: Bay[] = template.bays.map(bay => ({
      name: bay.name,
      items: bay.items.map(item => ({
        name: item.name,
        status: "X"
      }))
    }));

    setBays(copy);
  };

  // -----------------------------
  // TOGGLE CHECK ITEM
  // -----------------------------
  const toggleItem = (bIndex: number, iIndex: number) => {
    const updated = [...bays];

    const current = updated[bIndex].items[iIndex].status;

    if (current === "X") updated[bIndex].items[iIndex].status = "Pass";
    else if (current === "Pass") updated[bIndex].items[iIndex].status = "Fail";
    else updated[bIndex].items[iIndex].status = "Pass";

    setBays(updated);
  };

  const getColor = (status: Status) => {
    if (status === "Pass") return "green";
    if (status === "Fail") return "red";
    return "gray";
  };

  // -----------------------------
  // SUBMIT LOG
  // -----------------------------
  const handleSubmit = () => {
    setError("");

    if (!selectedTruck) {
      setError("Please select a truck.");
      return;
    }

    const hasX = bays.some(b =>
      b.items.some(i => i.status === "X")
    );

    if (hasX) {
      setError("All items must be Pass or Fail.");
      return;
    }

    const hasFail = bays.some(b =>
      b.items.some(i => i.status === "Fail")
    );

    if (hasFail && notes.trim() === "") {
      setError("Notes required when something fails.");
      return;
    }

    const newLog: LogEntry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      truck: selectedTruck,
      bays,
      notes
    };

    const updated = [newLog, ...logs];

    setLogs(updated);
    localStorage.setItem("truckLogs", JSON.stringify(updated));

    setSelectedTruck("");
    setBays([]);
    setNotes("");
  };

  // -----------------------------
  // DELETE LOG
  // -----------------------------
  const deleteLog = (id: number) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    localStorage.setItem("truckLogs", JSON.stringify(updated));
  };

  // -----------------------------
  // START EDIT
  // -----------------------------
  const startEdit = (log: LogEntry) => {
    setEditingLogId(log.id);
    setEditBays(JSON.parse(JSON.stringify(log.bays)));
    setEditNotes(log.notes);
  };

  // -----------------------------
  // TOGGLE ITEM IN EDIT MODE
  // -----------------------------
  const toggleEditItem = (bIndex: number, iIndex: number) => {
    const updated = [...editBays];

    const current = updated[bIndex].items[iIndex].status;

    if (current === "X") updated[bIndex].items[iIndex].status = "Pass";
    else if (current === "Pass") updated[bIndex].items[iIndex].status = "Fail";
    else updated[bIndex].items[iIndex].status = "Pass";

    setEditBays(updated);
  };

  // -----------------------------
  // SAVE EDIT
  // -----------------------------
  const saveEdit = () => {
    const updated = logs.map(log =>
      log.id === editingLogId
        ? { ...log, bays: editBays, notes: editNotes }
        : log
    );

    setLogs(updated);
    localStorage.setItem("truckLogs", JSON.stringify(updated));

    setEditingLogId(null);
    setEditBays([]);
    setEditNotes("");
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ padding: 20 }}>
      <h1>🚒 Truck Check System</h1>

      {/* TRUCK SELECT */}
      <h3>Select Truck</h3>

      <select
        value={selectedTruck}
        onChange={(e) => handleTruckChange(e.target.value)}
        style={{ padding: 8 }}
      >
        <option value="">-- Select Truck --</option>
        {truckNames.map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

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

      {error && <p style={{ color: "red" }}>{error}</p>}

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

      {/* HISTORY */}
      <hr style={{ margin: "30px 0" }} />

      <h2>Previous Logs</h2>

      {logs.map(log => (
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

              <button onClick={() => startEdit(log)} style={{ marginLeft: 5 }}>
                Edit
              </button>

              <button
                onClick={() => deleteLog(log.id)}
                style={{ marginLeft: 5, color: "red" }}
              >
                Delete
              </button>
            </div>
          </div>

          {/* VIEW */}
          {expandedLogId === log.id && editingLogId !== log.id && (
            <div>
              <p>{log.date}</p>

              {log.bays.map((bay, bIndex) => (
                <div key={bIndex}>
                  <h4>{bay.name}</h4>

                  {bay.items.map((item, iIndex) => (
                    <div
                      key={iIndex}
                      style={{
                        color:
                          item.status === "Pass"
                            ? "green"
                            : item.status === "Fail"
                            ? "red"
                            : "gray"
                      }}
                    >
                      {item.name}: {item.status}
                    </div>
                  ))}
                </div>
              ))}

              {log.notes && <p><em>{log.notes}</em></p>}
            </div>
          )}

          {/* EDIT */}
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

              <button onClick={saveEdit} style={{ marginTop: 10 }}>
                Save Changes
              </button>

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