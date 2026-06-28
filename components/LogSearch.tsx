"use client";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onReset: () => void;
  onPrint: () => void;
}

export default function LogSearch({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onReset,
  onPrint,
}: Props) {
  return (
    <div
      className="card"
      style={{
        marginTop: 30,
        marginBottom: 30,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 20,
          color: "#991b1b",
        }}
      >
        Search Logs
      </h3>

      <input
        placeholder="Search by truck, notes, or crew..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Start Date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            End Date
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={onReset}
        >
          Reset Filters
        </button>

        <button
          className="btn btn-primary"
          onClick={onPrint}
        >
          🖨 Print Results
        </button>
      </div>
    </div>
  );
}