"use client";

import { useRouter } from "next/navigation";

export default function AdminHome() {
  const router = useRouter();

  const cardStyle = {
    padding: 20,
    margin: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
    cursor: "pointer"
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push("/")}>⬅ Back</button>
      <h1>🛠️ Admin Dashboard</h1>

      <div
        style={cardStyle}
        onClick={() => router.push("/admin/trucks")}
      >
        🚒 Truck Management
      </div>

      <div
        style={cardStyle}
        onClick={() => router.push("/admin/maintenance")}
      >
        🔧 Maintenance Logs
      </div>

      <div
        style={cardStyle}
        onClick={() => router.push("/admin/training")}
      >
        📘 Training Logs
      </div>
    </div>
  );
}