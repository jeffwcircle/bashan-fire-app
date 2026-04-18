"use client";

import { useRouter } from "next/navigation";

export default function Maintenance() {
  const router = useRouter();

  return (
    <div style={{ padding: 20 }}>
      <h1>Maintenance Logs</h1>

      <button onClick={() => router.push("/")}>⬅ Back</button>

      <p>This is where your training logs will go.</p>
    </div>
  );
}