"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { usePermissions } from "./PermissionProvider";
import { useAuth } from "./AuthProvider";

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
  const router = useRouter();

  const { loading, can } = usePermissions();
  const { user, loading: authLoading } = useAuth();

  // If the user logs out while inside a protected module,
  // send them back to the dashboard.
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // Wait for authentication and permissions to finish loading.
  if (authLoading || loading) {
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

  // User is logged out.
  // The useEffect above will redirect to the dashboard.
  if (!user) {
    return null;
  }

  // User is logged in but does not have permission.
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
          <h2
            style={{
              marginTop: 0,
              marginBottom: 12,
            }}
          >
            Access Denied
          </h2>

          <p
            style={{
              marginBottom: 24,
              color: "#666",
            }}
          >
            You do not have permission to access this page.
          </p>

          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: 8,
              background: "#1f2937",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      )
    );
  }

  return <>{children}</>;
}