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

  // PRINT FILTERS
  const [printTruck, setPrintTruck] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // -----------------------------
  // LOAD LOGS
  // -----------------------------
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "truckLogs"), (snapshot) => {
      const data: LogEntry[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<LogEntry, "id">)
      }));

      setLogs(data);
    });

    return () => unsub();
  }, []);

  // -----------------------------
  // LOAD TEMPLATES
  // -----------------------------
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

  const truckNames = Object.keys(templates);

  // -----------------------------
  // LOAD TEMPLATE
  // -----------------------------
  const handleTruckChange = (truck: string) => {
    setSelectedTruck(truck);

    const template = templates[truck];
    if (!template?.bays) {
      setBays([]);
      return;
    }

    const copy: Bay[] = template.bays.map((bay: any) => ({
      name: bay.name,
      items: (bay.items || []).map((item: any) => ({
        name: item.name,
        status: "X"
      }))
    }));

    setBays(copy);
  };

  // -----------------------------
  // TOGGLE ITEM
  // -----------------------------
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

  const getColor = (status: Status) => {
    if (status === "Pass") return "green";
    if (status === "Fail") return "red";
    return "gray";
  };

  // -----------------------------
  // SUBMIT LOG (FIXED DATE)
  // -----------------------------
  const handleSubmit = async () => {
    setError("");

    if (!selectedTruck) {
      setError("Please select a truck.");
      return;
    }

    await addDoc(collection(db, "truckLogs"), {
      date: new Date().toISOString(), // IMPORTANT FIX
      truck: selectedTruck,
      bays,
      notes
    });

    setSelectedTruck("");
    setBays([]);
    setNotes("");
  };

  // -----------------------------
  // DELETE (FIXED)
  // -----------------------------
  const deleteLog = async (id: string) => {
    await deleteDoc(doc(db, "truckLogs", id));
  };

  // -----------------------------
  // EDIT
  // -----------------------------
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

  // -----------------------------
  // PRINT FILTER LOGIC (FIXED)
  // -----------------------------
  const filteredLogs = logs.filter((log) => {
    const matchesTruck =
      !printTruck || log.truck === printTruck;

    const logTime = new Date(log.date).getTime();
    const start = startDate ? new Date(startDate).getTime() : null;
    const end = endDate ? new Date(endDate).getTime() : null;

    const matchesStart = start ? logTime >= start : true;
    const matchesEnd = end ? logTime <= end : true;

    return matchesTruck && matchesStart && matchesEnd;
  });

  // -----------------------------
  // UI
  // -----------------------------
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

      <hr style={{ margin: "30px 0" }} />

      {/* PRINT CONTROLS */}
      <h3>Print Logs</h3>

      <select value={printTruck} onChange={(e) => setPrintTruck(e.target.value)}>
        <option value="">All Trucks</option>
        {truckNames.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

      <button
        onClick={() =>
          window.open(
            `/truckcheck/print?truck=${printTruck}&start=${startDate}&end=${endDate}`
          )
        }
      >
        Print Filtered Logs
      </button>

      {/* LOG LIST */}
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
	          window.open(
	            `/truckcheck/print?truck=${encodeURIComponent(log.truck)}&start=&end=`
	          )
	        }
	        style={{ marginLeft: 5 }}
	      >
	        Print
	      </button>

            </div>
          </div>

          {expandedLogId === log.id && (
            <div>
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
            </div>
          )}
        </div>
      ))}
    </div>
  );
}