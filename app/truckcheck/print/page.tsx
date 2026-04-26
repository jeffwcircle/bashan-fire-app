"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

export default function PrintPage() {
  const searchParams = useSearchParams();

  const id = searchParams.get("id"); // 👈 SINGLE LOG MODE
  const truck = searchParams.get("truck");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const [logs, setLogs] = useState<any[]>([]);

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

  // ---------------- FILTER LOGIC ----------------
  const filteredLogs = logs.filter((log) => {
    // ✅ SINGLE LOG MODE (highest priority)
    if (id) return log.id === id;

    const matchTruck = !truck || log.truck === truck;

    const time = new Date(log.date).getTime();
    const startTime = start ? new Date(start).getTime() : 0;
    const endTime = end ? new Date(end).getTime() + 86400000 : Infinity;

    return matchTruck && time >= startTime && time <= endTime;
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>🖨️ Print Logs</h1>

      {filteredLogs.length === 0 ? (
        <p>No log found.</p>
      ) : (
        filteredLogs.map((log) => (
          <div key={log.id} style={{ marginBottom: 20 }}>
            <h3>{log.truck}</h3>
            <p>{new Date(log.date).toLocaleString()}</p>

            {log.bays?.map((bay: any, i: number) => (
              <div key={i}>
                <strong>{bay.name}</strong>

                {bay.items?.map((item: any, j: number) => (
                  <div key={j}>
                    {item.name}: {item.status}
                  </div>
                ))}
              </div>
            ))}

            {log.notes && <p><em>{log.notes}</em></p>}

            {log.crew?.length > 0 && (
              <p>
                <strong>Crew:</strong> {log.crew.join(", ")}
              </p>
            )}
          </div>
        ))
      )}

      <button onClick={() => window.print()}>Print</button>
    </div>
  );
}