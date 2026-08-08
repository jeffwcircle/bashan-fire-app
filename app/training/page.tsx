"use client";

import { useRouter } from "next/navigation";

import RequirePermission from "@/components/auth/RequirePermission";

export default function Training() {
  const router = useRouter();

  return (
    <RequirePermission permission="training">
      <div style={{ padding: 20 }}>
        <h1>Training Logs</h1>

        <button onClick={() => router.push("/")}>
          ⬅ Back
        </button>

        <p>
          This is where your training logs will go.
        </p>
      </div>
    </RequirePermission>
  );
}