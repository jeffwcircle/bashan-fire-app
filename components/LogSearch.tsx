'use client'

export default function LogSearch({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onReset,
  onPrint
}: any) {
  return (
    <div style={{ marginTop: 15 }}>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />

      <div style={{ marginTop: 10 }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginLeft: 10 }}
        />

        <button onClick={onReset} style={{ marginLeft: 10 }}>
          Reset
        </button>
      </div>

      <button
        onClick={onPrint}
        style={{
          marginTop: 10,
          padding: 8,
          background: "#444",
          color: "white",
          borderRadius: 5
        }}
      >
        🖨 Print
      </button>
    </div>
  )
}