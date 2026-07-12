"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { MaintenanceItem } from "./MaintenanceInventory";
import MaintenanceRecordCard from "./MaintenanceRecordCard";
import MaintenanceRecordForm from "./MaintenanceRecordForm";

interface MaintenanceRecord {
  id?: string;
  maintenanceId: string;
  performedDate: any;
  performedBy: string;
  hours?: number;
  mileage?: number;
  cost?: number;
  vendor?: string;
  notes: string;
  nextDueDate: any;
  createdAt?: any;
}

interface Props {
  item: MaintenanceItem;
  onMaintenanceSaved?: (
    lastMaintenanceDate: any,
    nextDueDate: any
  ) => Promise<void>;
}

export default function MaintenanceHistory({
  item,
  onMaintenanceSaved,
}: Props) {
  const [records, setRecords] = useState<
    MaintenanceRecord[]
  >([]);

  const [adding, setAdding] =
    useState(false);

  useEffect(() => {
    if (!item.id) return;

    const q = query(
      collection(db, "maintenanceRecords"),
      where("maintenanceId", "==", item.id),
      orderBy("performedDate", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as MaintenanceRecord),
      }));

      setRecords(data);
    });

    return () => unsub();
  }, [item.id]);

  async function saveRecord(record: {
    performedDate: any;
    performedBy: string;
    hours?: number;
    mileage?: number;
    cost?: number;
    vendor?: string;
    notes: string;
  }) {
    const performedDate =
      record.performedDate || Timestamp.now();

    const nextDue = new Date(
      performedDate instanceof Timestamp
        ? performedDate.toDate()
        : new Date(performedDate)
    );

    switch (item.intervalUnit) {
      case "Days":
        nextDue.setDate(
          nextDue.getDate() + item.interval
        );
        break;

      case "Weeks":
        nextDue.setDate(
          nextDue.getDate() +
            item.interval * 7
        );
        break;

      case "Months":
        nextDue.setMonth(
          nextDue.getMonth() +
            item.interval
        );
        break;

      case "Years":
        nextDue.setFullYear(
          nextDue.getFullYear() +
            item.interval
        );
        break;
    }

    const nextDueTimestamp =
      Timestamp.fromDate(nextDue);

    await addDoc(
      collection(db, "maintenanceRecords"),
      {
        maintenanceId: item.id,
        ...record,
        performedDate,
        nextDueDate: nextDueTimestamp,
        createdAt: Timestamp.now(),
      }
    );

    if (onMaintenanceSaved) {
      await onMaintenanceSaved(
        performedDate,
        nextDueTimestamp
      );
    }

    setAdding(false);
  }

  return (
    <div
      className="card"
      style={{
        marginTop: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0 }}>
          Maintenance History
        </h2>

        {!adding && (
          <button
            className="btn btn-success"
            onClick={() =>
              setAdding(true)
            }
          >
            ➕ Add Maintenance Record
          </button>
        )}
      </div>

      {adding && (
        <MaintenanceRecordForm
          onSave={saveRecord}
          onCancel={() =>
            setAdding(false)
          }
        />
      )}

      <div
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        {records.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
              padding: 40,
            }}
          >
            No maintenance records.
          </div>
        ) : (
          records.map((record) => (
            <MaintenanceRecordCard
              key={record.id}
              record={record}
            />
          ))
        )}
      </div>
    </div>
  );
}