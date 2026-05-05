'use client'

import { useState } from 'react'

type Status = "X" | "Pass" | "Fail"

export default function LogCard({
  log,
  onDelete,
  onSaveEdit,
  forcePrint = false
}: any) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [crewOpen, setCrewOpen] = useState(false)

  const [editData, setEditData] = useState<any>(
    JSON.parse(JSON.stringify(log))
  )

  // 🔁 Toggle pass/fail
  const toggleItem = (bIndex: number, iIndex: number) => {
    const updated = { ...editData }
    const current = updated.bays[bIndex].items[iIndex].status

    updated.bays[bIndex].items[iIndex].status =
      current === "X"
        ? "Pass"
        : current === "Pass"
        ? "Fail"
        : "Pass"

    setEditData(updated)
  }

  const getColor = (status: Status) =>
    status === "Pass" ? "#2e7d32" :
    status === "Fail" ? "#c62828" :
    "#777"

  return (
    <div
  id={`log-${log.id}`}
      style={{
        border: "1px solid #ccc",
        padding: 12,
        borderRadius: 8,
        background: "white"
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <strong>{log.truck || "Log"}</strong>

          <div style={{ fontSize: 12, color: "#666" }}>
            {log.createdAt &&
              new Date(log.createdAt).toLocaleString()}
          </div>
        </div>

        <div>
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? "Hide" : "View"}
          </button>

          <button
            onClick={() => {
              setEditing(true)
              setEditData(JSON.parse(JSON.stringify(log)))
            }}
          >
            Edit
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(log.id)}
              style={{ color: "red" }}
            >
              Delete
            </button>
          )}
<button
  onClick={() => {
    const original = document.body.innerHTML
    const content = document.getElementById(`log-${log.id}`)?.innerHTML

    if (!content) return

    document.body.innerHTML = content
    window.print()
    document.body.innerHTML = original

    window.location.reload()
  }}
>
  🖨
</button>
        </div>
      </div>

      {/* ================= VIEW MODE ================= */}
{(expanded || forcePrint) && !editing && (
  <div className="log-details" style={{ marginTop: 10 }}>
          {/* 🚒 Truck Check Bays */}
          {log.bays?.map((bay: any, bIndex: number) => (
            <div key={bIndex} style={{ marginBottom: 10 }}>
              <strong>{bay.name}</strong>

              {bay.items.map((item: any, iIndex: number) => (
                <div
                  key={iIndex}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eee",
                    padding: "4px 0"
                  }}
                >
                  <span>{item.name}</span>

                  <span
                    style={{
                      color:
                        item.status === "Pass"
                          ? "green"
                          : item.status === "Fail"
                          ? "red"
                          : "#777",
                      fontWeight: "bold"
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {/* 🔧 Maintenance Fields */}
          {log.location && (
            <p><b>Location:</b> {log.location}</p>
          )}

          {/* 📝 Notes */}
          {log.notes && <p><i>{log.notes}</i></p>}

          {/* 👥 Crew */}
          {log.crew?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong>Crew:</strong>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {log.crew.map((person: string, i: number) => (
                  <li key={i}>{person}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ================= EDIT MODE ================= */}
      {editing && (
        <div style={{ marginTop: 10 }}>
          <h4>Edit Log</h4>

          {/* 🚒 Edit Bays */}
          {editData.bays?.map((bay: any, bIndex: number) => (
            <div key={bIndex}>
              <strong>{bay.name}</strong>

              {bay.items.map((item: any, iIndex: number) => (
                <div
                  key={iIndex}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0"
                  }}
                >
                  <span>{item.name}</span>

                  <button
                    onClick={() => toggleItem(bIndex, iIndex)}
                    style={{
                      minWidth: 80,
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

          {/* 🔧 Edit Location */}
          {editData.location !== undefined && (
            <input
              value={editData.location || ""}
              onChange={(e) =>
                setEditData({ ...editData, location: e.target.value })
              }
              placeholder="Location"
              style={{ width: "100%", marginTop: 10 }}
            />
          )}

          {/* 📝 Edit Notes */}
          <textarea
            value={editData.notes || ""}
            onChange={(e) =>
              setEditData({ ...editData, notes: e.target.value })
            }
            style={{ width: "100%", marginTop: 10 }}
          />

          {/* 👥 Crew Selection */}
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
              👥 Crew ({editData.crew?.length || 0})
            </button>

            {crewOpen && (
              <div style={{ border: "1px solid #ccc", padding: 10 }}>
                {(log.availableUsers || []).map((u: any) => {
                  const name =
                    `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.id

                  const selected = editData.crew?.includes(name)

                  return (
                    <div key={u.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const updatedCrew = selected
                              ? editData.crew.filter((x: string) => x !== name)
                              : [...(editData.crew || []), name]

                            setEditData({
                              ...editData,
                              crew: updatedCrew
                            })
                          }}
                        />
                        {" "}{name}
                      </label>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => {
                onSaveEdit(editData)
                setEditing(false)
              }}
            >
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              style={{ marginLeft: 10 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

<style jsx>{`
  @media print {
    .log-details {
      display: block !important;
    }
  }
`}</style>