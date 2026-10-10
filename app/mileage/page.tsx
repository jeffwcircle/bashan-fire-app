
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import PageContainer from "@/components/PageContainer";
import RequirePermission from "@/components/auth/RequirePermission";

interface Truck {
  id: string;
  name: string;
}

interface MileageLog {
  id: string;
  truckId: string;
  truckName: string;
  date: string;
  startMileage: number;
  endMileage: number;
  milesDriven?: number;
  reason: string;
  notes: string;
  createdAt?: Timestamp;
}

export default function TruckMileagePage() {
  const router = useRouter();

  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [logs, setLogs] = useState<MileageLog[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [startMileage, setStartMileage] = useState("");
  const [endMileage, setEndMileage] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "truckTemplates"),
      (snapshot) => {
        const data = snapshot.docs.map((truckDoc) => {
          const truckData = truckDoc.data();

          return {
            id: truckDoc.id,
            name: truckData.name || truckDoc.id,
          };
        });

        data.sort((a, b) => a.name.localeCompare(b.name));
        setTrucks(data);
      },
      (error) => {
        console.error("Error loading trucks:", error);
        alert("Unable to load trucks.");
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedTruck) {
      setLogs([]);
      return;
    }

    const logsQuery = query(
      collection(db, "truckMileageLogs"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const data = snapshot.docs
          .map((logDoc) => ({
            id: logDoc.id,
            ...(logDoc.data() as Omit<MileageLog, "id">),
          }))
          .filter((log) => log.truckId === selectedTruck.id)
          .sort((a, b) => {
            const dateDifference = b.date.localeCompare(a.date);

            if (dateDifference !== 0) return dateDifference;

            return (
              (b.createdAt?.toMillis() || 0) -
              (a.createdAt?.toMillis() || 0)
            );
          });

        setLogs(data);
      },
      (error) => {
        console.error("Error loading mileage logs:", error);
        alert("Unable to load mileage records.");
      }
    );

    return () => unsubscribe();
  }, [selectedTruck]);

  function resetForm() {
    setDate(new Date().toLocaleDateString("en-CA"));
    setStartMileage("");
    setEndMileage("");
    setReason("");
    setNotes("");
  }

  async function handleSubmit() {
    if (!selectedTruck) return;

    if (!date || startMileage === "" || endMileage === "") {
      alert("Please enter the date, starting mileage, and ending mileage.");
      return;
    }

    const start = Number(startMileage);
    const end = Number(endMileage);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end < start
    ) {
      alert(
        "Please enter valid mileage. Ending mileage cannot be less than starting mileage."
      );
      return;
    }

    if (!reason.trim()) {
      alert("Please enter the reason for use.");
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "truckMileageLogs"), {
        truckId: selectedTruck.id,
        truckName: selectedTruck.name,
        date,
        startMileage: start,
        endMileage: end,
        milesDriven: end - start,
        reason: reason.trim(),
        notes: notes.trim(),
        createdAt: Timestamp.now(),
      });

      resetForm();
      setShowMore(false);
      alert("Mileage record saved.");
    } catch (error) {
      console.error("Error saving mileage record:", error);
      alert("Unable to save the mileage record.");
    } finally {
      setSaving(false);
    }
  }

  // Delete a mileage record without changing the existing layout.
  async function handleDeleteLog(log: MileageLog) {
    const confirmed = window.confirm(
      `Delete the mileage record for ${selectedTruck?.name} dated ${log.date}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingLogId(log.id);

    try {
      await deleteDoc(doc(db, "truckMileageLogs", log.id));
      // The existing Firestore listener automatically updates the history.
    } catch (error) {
      console.error("Error deleting mileage record:", error);
      alert("Unable to delete the mileage record.");
    } finally {
      setDeletingLogId(null);
    }
  }

  return (
    <RequirePermission permission="mileage">
      <PageContainer title="Truck Mileage">
      <button
        className="btn btn-secondary"
        style={{ marginBottom: 24 }}
        onClick={() => router.push("/")}
      >
        ← Back to Dashboard
      </button>

      {!selectedTruck ? (
        <div>
          <h2>Select a Truck</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {trucks.length === 0 ? (
              <div className="card">
                No trucks are available.
              </div>
            ) : (
              trucks.map((truck) => (
                <button
                  key={truck.id}
                  className="card"
                  onClick={() => {
                    setSelectedTruck(truck);
                    resetForm();
                    setShowMore(false);
                  }}
                  style={{
                    padding: 24,
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 18,
                    fontWeight: 700,
                    border: "1px solid #ddd",
                  }}
                >
                  🚒 {truck.name}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      marginTop: 8,
                    }}
                  >
                    Record or review mileage
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <button
            className="btn btn-secondary"
            style={{ marginBottom: 20 }}
            onClick={() => {
              setSelectedTruck(null);
              resetForm();
            }}
          >
            ← Back to Truck List
          </button>

          <h2>{selectedTruck.name} Mileage</h2>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0 }}>New Mileage Record</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Starting Mileage
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={startMileage}
                  onChange={(e) => setStartMileage(e.target.value)}
                  placeholder="Enter starting mileage"
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Ending Mileage
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={endMileage}
                  onChange={(e) => setEndMileage(e.target.value)}
                  placeholder="Enter ending mileage"
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Reason for Use
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Example: Emergency response"
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {startMileage !== "" &&
              endMileage !== "" &&
              Number(endMileage) >= Number(startMileage) && (
                <p style={{ fontWeight: 700, marginTop: 16 }}>
                  Miles Driven:{" "}
                  {(
                    Number(endMileage) - Number(startMileage)
                  ).toLocaleString()}
                </p>
              )}

            <div style={{ marginTop: 16 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information (optional)"
                rows={3}
                style={{
                  width: "100%",
                  padding: 12,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={saving}
              style={{ marginTop: 20, width: "100%", padding: 14 }}
            >
              {saving ? "Saving..." : "Submit Mileage Record"}
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Mileage History</h3>

            {logs.length === 0 ? (
              <p>No mileage records have been entered for this truck.</p>
            ) : (
              <>
                <div style={{ display: "grid", gap: 12 }}>
                  {logs
                    .slice(0, showMore ? undefined : 10)
                    .map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: 16,
                          border: "1px solid #ddd",
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <strong>
                            {new Date(
                              `${log.date}T12:00:00`
                            ).toLocaleDateString()}
                          </strong>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 12,
                            }}
                          >
                            <strong>
                              {Number(
                                log.milesDriven ??
                                  log.endMileage - log.startMileage
                              ).toLocaleString()}{" "}
                              miles driven
                            </strong>

                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => handleDeleteLog(log)}
                              disabled={deletingLogId === log.id}
                            >
                              {deletingLogId === log.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>

                        <div style={{ marginTop: 8 }}>
                          Start:{" "}
                          {Number(log.startMileage).toLocaleString()} miles
                          {" · "}
                          End: {Number(log.endMileage).toLocaleString()} miles
                        </div>

                        <div style={{ marginTop: 8 }}>
                          <strong>Reason:</strong> {log.reason}
                        </div>

                        {log.notes && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Notes:</strong> {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {logs.length > 10 && (
                  <button
                    className="btn btn-secondary"
                    style={{ width: "100%", marginTop: 16 }}
                    onClick={() => setShowMore((current) => !current)}
                  >
                    {showMore
                      ? "Show Less"
                      : `Show More (${logs.length - 10} additional records)`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </PageContainer>
    </RequirePermission>
  );
}
