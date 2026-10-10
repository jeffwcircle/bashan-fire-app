"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface Procedure {
  id?: string;
  name: string;
  description: string;
  createdAt?: Timestamp;
}

interface ProcedureStep {
  id?: string;
  procedureId: string;
  stepNumber: number;
  instruction: string;
  createdAt?: Timestamp;
}

export default function Procedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [steps, setSteps] = useState<ProcedureStep[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [selectedProcedure, setSelectedProcedure] =
    useState<Procedure | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingProcedure, setEditingProcedure] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [newStep, setNewStep] = useState("");

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepText, setEditingStepText] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "procedures"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Procedure, "id">),
        }));

        data.sort((a, b) => a.name.localeCompare(b.name));

        setProcedures(data);

        setSelectedProcedure((current) => {
          if (!current?.id) return current;

          const updated = data.find(
            (procedure) => procedure.id === current.id
          );

          return updated || current;
        });
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const stepsQuery = query(
      collection(db, "procedureSteps"),
      orderBy("stepNumber", "asc")
    );

    const unsubscribe = onSnapshot(
      stepsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ProcedureStep, "id">),
        }));

        setSteps(data);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleSaveProcedure() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      alert("Please enter a procedure name.");
      return;
    }

    await addDoc(collection(db, "procedures"), {
      name: trimmedName,
      description: trimmedDescription,
      createdAt: Timestamp.now(),
    });

    setName("");
    setDescription("");
    setShowForm(false);
  }

  function handleCancelProcedure() {
    setName("");
    setDescription("");
    setShowForm(false);
  }

  function handleStartEditProcedure() {
    if (!selectedProcedure) return;

    setEditName(selectedProcedure.name);
    setEditDescription(selectedProcedure.description);
    setEditingProcedure(true);
  }

  function handleCancelEditProcedure() {
    setEditName("");
    setEditDescription("");
    setEditingProcedure(false);
  }

  async function handleUpdateProcedure() {
    if (!selectedProcedure?.id) return;

    const trimmedName = editName.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedName) {
      alert("Please enter a procedure name.");
      return;
    }

    await updateDoc(doc(db, "procedures", selectedProcedure.id), {
      name: trimmedName,
      description: trimmedDescription,
    });

    setSelectedProcedure({
      ...selectedProcedure,
      name: trimmedName,
      description: trimmedDescription,
    });

    setEditName("");
    setEditDescription("");
    setEditingProcedure(false);
  }

  function handleStartEditStep(step: ProcedureStep) {
    if (!step.id) return;

    setEditingStepId(step.id);
    setEditingStepText(step.instruction);
  }

  function handleCancelEditStep() {
    setEditingStepId(null);
    setEditingStepText("");
  }

  async function handleUpdateStep(step: ProcedureStep) {
    if (!step.id) return;

    const trimmedInstruction = editingStepText.trim();

    if (!trimmedInstruction) {
      alert("Please enter a step instruction.");
      return;
    }

    await updateDoc(doc(db, "procedureSteps", step.id), {
      instruction: trimmedInstruction,
    });

    setEditingStepId(null);
    setEditingStepText("");
  }

  async function handleAddStep() {
    if (!selectedProcedure?.id) return;

    const trimmedStep = newStep.trim();

    if (!trimmedStep) {
      alert("Please enter a step.");
      return;
    }

    const procedureSteps = steps.filter(
      (step) => step.procedureId === selectedProcedure.id
    );

    await addDoc(collection(db, "procedureSteps"), {
      procedureId: selectedProcedure.id,
      stepNumber: procedureSteps.length + 1,
      instruction: trimmedStep,
      createdAt: Timestamp.now(),
    });

    setNewStep("");
  }

  async function handleDeleteStep(step: ProcedureStep) {
    if (!step.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this step?"
    );

    if (!confirmed) return;

    await deleteDoc(doc(db, "procedureSteps", step.id));

    const remainingSteps = steps
      .filter(
        (item) =>
          item.procedureId === step.procedureId &&
          item.id !== step.id
      )
      .sort((a, b) => a.stepNumber - b.stepNumber);

    for (let index = 0; index < remainingSteps.length; index++) {
      const item = remainingSteps[index];

      if (item.id && item.stepNumber !== index + 1) {
        await updateDoc(doc(db, "procedureSteps", item.id), {
          stepNumber: index + 1,
        });
      }
    }
  }

  async function moveStep(
    step: ProcedureStep,
    direction: "up" | "down"
  ) {
    if (!step.id) return;

    const procedureSteps = steps
      .filter((item) => item.procedureId === step.procedureId)
      .sort((a, b) => a.stepNumber - b.stepNumber);

    const currentIndex = procedureSteps.findIndex(
      (item) => item.id === step.id
    );

    if (currentIndex === -1) return;

    const newIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      newIndex < 0 ||
      newIndex >= procedureSteps.length
    ) {
      return;
    }

    const otherStep = procedureSteps[newIndex];

    if (!otherStep.id) return;

    await updateDoc(doc(db, "procedureSteps", step.id), {
      stepNumber: otherStep.stepNumber,
    });

    await updateDoc(doc(db, "procedureSteps", otherStep.id), {
      stepNumber: step.stepNumber,
    });
  }

  const selectedSteps = selectedProcedure
    ? steps
        .filter(
          (step) =>
            step.procedureId === selectedProcedure.id
        )
        .sort((a, b) => a.stepNumber - b.stepNumber)
    : [];

  if (selectedProcedure) {
    return (
      <div>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setEditingProcedure(false);
            setEditingStepId(null);
            setSelectedProcedure(null);
          }}
          style={{ marginBottom: 24 }}
        >
          ← Back to Procedures
        </button>

        <div
          className="card"
          style={{
            marginBottom: 24,
          }}
        >
          {!editingProcedure ? (
            <>
              <h2 style={{ marginTop: 0 }}>
                {selectedProcedure.name}
              </h2>

              <p>
                {selectedProcedure.description ||
                  "No description provided."}
              </p>

              <button
                className="btn btn-secondary"
                onClick={handleStartEditProcedure}
              >
                ✏️ Edit Procedure
              </button>
            </>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>
                Edit Procedure
              </h2>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Procedure Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: 12,
                    fontSize: 16,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Description
                </label>

                <textarea
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(e.target.value)
                  }
                  rows={4}
                  style={{
                    width: "100%",
                    padding: 12,
                    fontSize: 16,
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="btn btn-success"
                  onClick={handleUpdateProcedure}
                >
                  Save Changes
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleCancelEditProcedure}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>
            Procedure Steps
          </h2>

          {selectedSteps.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 30,
                marginBottom: 20,
              }}
            >
              No steps have been added yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {selectedSteps.map((step, index) => (
                <div
                  key={step.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      minWidth: 30,
                    }}
                  >
                    {step.stepNumber}.
                  </div>

                  {editingStepId === step.id ? (
                    <>
                      <input
                        type="text"
                        value={editingStepText}
                        onChange={(e) =>
                          setEditingStepText(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateStep(step);
                          }

                          if (e.key === "Escape") {
                            handleCancelEditStep();
                          }
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: 10,
                          fontSize: 16,
                          boxSizing: "border-box",
                        }}
                      />

                      <button
                        className="btn btn-success"
                        onClick={() =>
                          handleUpdateStep(step)
                        }
                      >
                        Save
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelEditStep}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        {step.instruction}
                      </div>

                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          handleStartEditStep(step)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          moveStep(step, "up")
                        }
                        disabled={index === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          moveStep(step, "down")
                        }
                        disabled={
                          index ===
                          selectedSteps.length - 1
                        }
                        title="Move Down"
                      >
                        ↓
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          handleDeleteStep(step)
                        }
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 250,
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                New Step
              </label>

              <input
                type="text"
                value={newStep}
                onChange={(e) =>
                  setNewStep(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddStep();
                  }
                }}
                placeholder="Enter testing step"
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              className="btn btn-success"
              onClick={handleAddStep}
            >
              ➕ Add Step
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!showForm && (
        <button
          className="btn btn-success"
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            padding: 16,
            marginBottom: 24,
          }}
        >
          ➕ Add Procedure
        </button>
      )}

      {showForm && (
        <div
          className="card"
          style={{
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            New Procedure
          </h2>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Procedure Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter procedure name"
              style={{
                width: "100%",
                padding: 12,
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Enter a description"
              rows={4}
              style={{
                width: "100%",
                padding: 12,
                fontSize: 16,
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-success"
              onClick={handleSaveProcedure}
            >
              Save Procedure
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleCancelProcedure}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        {procedures.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: 40,
            }}
          >
            No procedures have been created yet.
          </div>
        ) : (
          procedures.map((procedure) => (
            <button
              key={procedure.id}
              onClick={() =>
                setSelectedProcedure(procedure)
              }
              style={{
                textAlign: "left",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: 0,
              }}
            >
              <div
                className="card"
                style={{
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  {procedure.name}
                </h3>

                <div>
                  {procedure.description ||
                    "No description provided."}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontWeight: 600,
                  }}
                >
                  {
                    steps.filter(
                      (step) =>
                        step.procedureId ===
                        procedure.id
                    ).length
                  }{" "}
                  step
                  {steps.filter(
                    (step) =>
                      step.procedureId ===
                      procedure.id
                  ).length === 1
                    ? ""
                    : "s"}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}