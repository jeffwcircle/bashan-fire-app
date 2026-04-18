"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const cardStyle: React.CSSProperties = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    textAlign: "center"
  };

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    padding: "20px"
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Fire Department Dashboard</h1>

      <div style={containerStyle}>
        <div onClick={() => router.push("/maintenance")}>
          🛠️ Maintenance Logs
        </div>

        <div style={cardStyle} onClick={() => router.push("/training")}>
          📘 Training Logs
        </div>

        <div style={cardStyle} onClick={() => router.push("/truckcheck")}>
          🚒 Truck Check Logs
        </div>

        <div style={cardStyle} onClick={() => router.push("/tracker")}>
          👨‍🚒 Status Tracker
        </div>
      </div>
    </div>
  );
}