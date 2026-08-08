"use client";

import { ReactNode } from "react";
import { usePermissions } from "./PermissionProvider";

interface Props {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RequirePermission({
  permission,
  children,
  fallback,
}: Props) {
  const { loading, can } = usePermissions();

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
        }}
      >
        Loading permissions...
      </div>
    );
  }

  if (!can(permission)) {
    return (
      fallback ?? (
        <div
          style={{
            maxWidth: 600,
            margin: "60px auto",
            textAlign: "center",
            padding: 32,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <h2>Access Denied</h2>

          <p>
            You do not have permission to access this page.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}