'use client'

export default function LogForm({
  truck,
  setTruck,
  truckNames,
  crew,
  setCrew,
  users,
  startDate,
  setStartDate,
  completeDate,
  setCompleteDate,
  location,
  setLocation,
  notes,
  setNotes,
  annual,
  setAnnual,
  checks,
  setChecks,
  handleSubmit,
  editingId
}: any) {
  return (
    <div style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
      
      <select
        value={truck}
        onChange={(e) => setTruck(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      >
        <option value="">Select Truck</option>
        {truckNames.map((t: string) => (
          <option key={t}>{t}</option>
        ))}
      </select>

      {/* Crew */}
      <div style={{ marginTop: 10 }}>
        {users.map((u: any) => {
          const name = `${u.first_name} ${u.last_name}`
          const selected = crew.includes(name)

          return (
            <label key={u.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  setCrew((prev: string[]) =>
                    selected
                      ? prev.filter((x) => x !== name)
                      : [...prev, name]
                  )
                }
              />{" "}
              {name}
            </label>
          )
        })}
      </div>

      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={completeDate} onChange={(e) => setCompleteDate(e.target.value)} />

      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Checks */}
      <div>
        {["oil", "tires", "fuel", "water"].map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={checks[key]}
              onChange={() =>
                setChecks((prev: any) => ({
                  ...prev,
                  [key]: !prev[key]
                }))
              }
            />
            {key}
          </label>
        ))}
      </div>

      <label>
        <input
          type="checkbox"
          checked={annual}
          onChange={() => setAnnual(!annual)}
        />
        Annual
      </label>

      <button onClick={handleSubmit}>
        {editingId ? "Update Log" : "Save Log"}
      </button>
    </div>
  )
}