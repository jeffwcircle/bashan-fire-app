"use client";

import { useRouter } from "next/navigation";

export default function TruckAdmin() {
  const router = useRouter();

  // ---------------- UI ----------------
  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push("./")}>⬅ Back</button>
    </div>
  );
}