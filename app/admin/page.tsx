"use client";

import { useRouter } from "next/navigation";

import { usePermissions } from "@/components/auth/PermissionProvider";
import RequirePermission from "@/components/auth/RequirePermission";
import { useProfile } from "@/components/auth/ProfileProvider";

export default function AdminHome() {
  const router = useRouter();
  const { profile } = useProfile();

  const { can } = usePermissions();

  const cardStyle = {
    padding: 20,
    margin: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
    cursor: "pointer",
    transition: "0.2s",
  };

  return (
    <RequirePermission permission="administration">
      <div style={{ padding: 20 }}>
        <button
          className="btn btn-secondary"
          onClick={() => router.push("/")}
        >
          ⬅ Back
        </button>

        <h1 style={{ marginTop: 20 }}>
          🛠️ Admin Dashboard
        </h1>

        <p style={{ color: "#666" }}>
          Welcome, {profile?.first_name}. You are logged in as{" "}
          <strong>{profile?.role}</strong>.
        </p>

	{can("members") && (
        <div
          style={cardStyle}
          onClick={() =>
            router.push("/admin/members")
          }
        >
          👥 Member Management
        </div>
	)}


	{can("administration_permissions") && (
	<div
	  style={cardStyle}
	  onClick={() =>
	    router.push("/admin/permissions")
	  }
	>
	  🔐 Permission Management
	</div>
        )}

        <div
          style={cardStyle}
          onClick={() =>
            router.push("/admin/trucks")
          }
        >
          🚒 Truck Management
        </div>

        <div
          style={cardStyle}
          onClick={() =>
            router.push("/admin/equipment")
          }
        >
          🧰 Equipment Management
        </div>

        <div
          style={cardStyle}
          onClick={() =>
            router.push("/admin/maintenance")
          }
        >
          🔧 Maintenance Logs
        </div>

        <div
          style={cardStyle}
          onClick={() =>
            router.push("/admin/training")
          }
        >
          📘 Training Logs
        </div>

        <div
          style={cardStyle}
          onClick={() =>
            router.push(
              "/admin/icecreamcontroller"
            )
          }
        >
          🍦 Ice Cream Social
        </div>

        <div
          style={cardStyle}
          onClick={() =>
            router.push("/admin/photoupload")
          }
        >
          📷 Photo Upload
        </div>
      </div>
    </RequirePermission>
  );
}