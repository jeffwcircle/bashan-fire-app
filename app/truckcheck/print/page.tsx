"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

type LogEntry = {
  id: string;
  date: string;
  truck: string;
  bays: any[];
  notes: string;
};

export default function PrintPage() {
  const searchParams = useSearchParams();

  const truck = searchParams.get("truck") || "";
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

  const [logs, setLogs] = useState<LogEntry[]>([]);

  // LOAD LOGS
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

  // SAFE DATE FILTER
  const filtered = logs.filter((log) => {
    const logTime = new Date(log.date).getTime();

    const startTime = start
      ? new Date(start + "T00:00:00").getTime()
      : 0;

    const endTime = end
      ? new Date(end + "T23:59:59").getTime()
      : Infinity;

    const matchTruck = truck ? log.truck === truck : true;

    return matchTruck && logTime >= startTime && logTime <= endTime;
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>🖨️ Print Truck Logs</h1>

      <p>
        Truck: <b>{truck || "All"}</b>
      </p>

      <p>
        Date Range: <b>{start || "Any"} → {end || "Any"}</b>
      </p>

      <hr />

      {filtered.length === 0 ? (
        <p>No logs found for this filter.</p>
      ) : (
        filtered.map((log) => (
          <div key={log.id} style={{ marginBottom: 20 }}>
            <h3>{log.truck}</h3>
            <p>{new Date(log.date).toLocaleString()}</p>

            {log.bays.map((bay: any, i: number) => (
              <div key={i}>
                <strong>{bay.name}</strong>

                {bay.items.map((item: any, j: number) => (
                  <div key={j}>
                    {item.name}: {item.status}
                  </div>
                ))}
              </div>
            ))}

            {log.notes && <p><em>{log.notes}</em></p>}
          </div>
        ))
      )}

      <button onClick={() => window.print()}>
        🖨️ Print
      </button>
    </div>
  );
}