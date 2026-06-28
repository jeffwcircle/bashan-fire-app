"use client";

interface Props {
  truck: string;
  setTruck: (v: string) => void;
  truckNames: string[];

  crew: string[];
  setCrew: any;

  users: any[];

  startDate: string;
  setStartDate: (v: string) => void;

  completeDate: string;
  setCompleteDate: (v: string) => void;

  location: string;
  setLocation: (v: string) => void;

  notes: string;
  setNotes: (v: string) => void;

  annual: boolean;
  setAnnual: (v: boolean) => void;

  checks: any;
  setChecks: any;

  handleSubmit: () => void;

  editingId?: string;
}

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
  editingId,
}: Props) {
  return (
    <div className="card">

      <h2
        style={{
          marginTop: 0,
          color: "#991b1b",
        }}
      >
        {editingId ? "Edit Log" : "New Log"}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        <div>
          <label><b>Truck</b></label>

          <select
            value={truck}
            onChange={(e) => setTruck(e.target.value)}
          >
            <option value="">Select Truck</option>

            {truckNames.map((t) => (
              <option key={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label><b>Location</b></label>

          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label><b>Start Date</b></label>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />
        </div>

        <div>
          <label><b>Completion Date</b></label>

          <input
            type="date"
            value={completeDate}
            onChange={(e) =>
              setCompleteDate(e.target.value)
            }
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 25,
        }}
      >
        <b>Crew Members</b>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 8,
            marginTop: 12,
          }}
        >
          {users.map((u) => {
            const name =
              `${u.first_name} ${u.last_name}`.trim();

            const selected =
              crew.includes(name);

            return (
              <label
                key={u.id}
                style={{
                  background: selected
                    ? "#dcfce7"
                    : "#ffffff",
                  border: "1px solid #dbe3eb",
                  borderRadius: 10,
                  padding: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    setCrew((prev: string[]) =>
                      selected
                        ? prev.filter(
                            (x) => x !== name
                          )
                        : [...prev, name]
                    )
                  }
                />

                {" "}
                {name}
              </label>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 25,
        }}
      >
        <b>Inspection Items</b>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 10,
            marginTop: 10,
          }}
        >
          {["oil","tires","fuel","water"].map((key)=>(
            <label
              key={key}
              style={{
                background:"#f8fafc",
                border:"1px solid #dbe3eb",
                padding:12,
                borderRadius:10,
                cursor:"pointer"
              }}
            >
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={()=>
                  setChecks((prev:any)=>({
                    ...prev,
                    [key]:!prev[key]
                  }))
                }
              />

              {" "}

              {key.charAt(0).toUpperCase()+key.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop:25
        }}
      >
        <label
          style={{
            fontWeight:700
          }}
        >
          <input
            type="checkbox"
            checked={annual}
            onChange={() =>
              setAnnual(!annual)
            }
          />

          {" "}Annual Inspection
        </label>
      </div>

      <div
        style={{
          marginTop:25
        }}
      >
        <textarea
          rows={5}
          placeholder="Notes..."
          value={notes}
          onChange={(e)=>
            setNotes(e.target.value)
          }
        />
      </div>

      <button
        className="btn btn-primary"
        style={{
          marginTop:30,
          width:"100%",
          padding:16,
          fontSize:"1rem"
        }}
        onClick={handleSubmit}
      >
        {editingId
          ? "Update Log"
          : "Save Log"}
      </button>

    </div>
  );
}