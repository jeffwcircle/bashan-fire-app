"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Equipment } from "@/lib/types/equipment";

interface Procedure {
  id: string;
  name: string;
  description?: string;
}

interface ProcedureAssignment {
  id: string;
  equipmentId: string;
  procedureId: string;
}

interface Props {
  equipment: Equipment;
}

export default function EquipmentProcedureAssignments({
  equipment,
}: Props) {
  const [procedures, setProcedures] =
    useState<Procedure[]>([]);

  const [assignments, setAssignments] =
    useState<ProcedureAssignment[]>([]);

  const [selectedProcedure, setSelectedProcedure] =
    useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "procedures"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Procedure, "id">),
        }));

        data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setProcedures(data);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!equipment.id) {
      setAssignments([]);
      return;
    }

    const assignmentsQuery = query(
      collection(
        db,
        "equipmentProcedureAssignments"
      ),
      where(
        "equipmentId",
        "==",
        equipment.id
      )
    );

    const unsub = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const data =
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<
              ProcedureAssignment,
              "id"
            >),
          }));

        setAssignments(data);
      }
    );

    return () => unsub();
  }, [equipment.id]);

  const assignedProcedureIds = useMemo(
    () =>
      new Set(
        assignments.map(
          (assignment) =>
            assignment.procedureId
        )
      ),
    [assignments]
  );

  const assignedProcedures = procedures.filter(
    (procedure) =>
      assignedProcedureIds.has(procedure.id)
  );

  const availableProcedures =
    procedures.filter(
      (procedure) =>
        !assignedProcedureIds.has(
          procedure.id
        )
    );

  async function handleAdd() {
    if (
      !equipment.id ||
      !selectedProcedure ||
      saving
    ) {
      return;
    }

    if (
      assignedProcedureIds.has(
        selectedProcedure
      )
    ) {
      setSelectedProcedure("");
      return;
    }

    setSaving(true);

    try {
      await addDoc(
        collection(
          db,
          "equipmentProcedureAssignments"
        ),
        {
          equipmentId: equipment.id,
          procedureId: selectedProcedure,
          createdAt: Timestamp.now(),
        }
      );

      setSelectedProcedure("");
    } catch (error) {
      console.error(
        "Error assigning procedure:",
        error
      );
      alert(
        "Unable to assign the procedure."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(
    assignmentId: string
  ) {
    try {
      await deleteDoc(
        doc(
          db,
          "equipmentProcedureAssignments",
          assignmentId
        )
      );
    } catch (error) {
      console.error(
        "Error removing procedure assignment:",
        error
      );
      alert(
        "Unable to remove the procedure."
      );
    }
  }

  return (
    <div
      className="card"
      style={{ marginTop: 24 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            Assigned Procedures
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              color: "#6b7280",
            }}
          >
            Procedures assigned to this
            equipment can be selected during
            equipment testing.
          </p>
        </div>
      </div>

      {assignedProcedures.length === 0 ? (
        <div
          style={{
            padding: 20,
            borderRadius: 8,
            background: "#f9fafb",
            color: "#6b7280",
            marginBottom: 20,
          }}
        >
          No procedures are assigned to this
          equipment.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {assignedProcedures.map(
            (procedure) => {
              const assignment =
                assignments.find(
                  (item) =>
                    item.procedureId ===
                    procedure.id
                );

              return (
                <div
                  key={procedure.id}
                  className="card"
                  style={{
                    padding: 16,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                      }}
                    >
                      {procedure.name}
                    </div>

                    {procedure.description && (
                      <div
                        style={{
                          marginTop: 4,
                          color: "#6b7280",
                        }}
                      >
                        {
                          procedure.description
                        }
                      </div>
                    )}
                  </div>

                  {assignment && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() =>
                        handleRemove(
                          assignment.id
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "end",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 260,
          }}
        >
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Add Procedure
          </label>

          <select
            value={selectedProcedure}
            onChange={(event) =>
              setSelectedProcedure(
                event.target.value
              )
            }
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "white",
            }}
          >
            <option value="">
              Select a procedure...
            </option>

            {availableProcedures.map(
              (procedure) => (
                <option
                  key={procedure.id}
                  value={procedure.id}
                >
                  {procedure.name}
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="button"
          className="btn btn-success"
          onClick={handleAdd}
          disabled={
            !selectedProcedure || saving
          }
        >
          {saving
            ? "Adding..."
            : "➕ Add Procedure"}
        </button>
      </div>

      {procedures.length === 0 && (
        <p
          style={{
            marginTop: 16,
            color: "#6b7280",
          }}
        >
          No procedures have been created yet.
        </p>
      )}

      {procedures.length > 0 &&
        availableProcedures.length === 0 &&
        assignments.length > 0 && (
          <p
            style={{
              marginTop: 16,
              color: "#6b7280",
            }}
          >
            All available procedures are
            already assigned.
          </p>
        )}
    </div>
  );
}
