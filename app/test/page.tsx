"use client";

import { usePermissions } from "@/components/auth/PermissionProvider";

export default function TestPage() {
  const {
    permissions,
    can,
    loading,
  } = usePermissions();

  if (loading)
    return <div>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Permissions Test</h1>

      <pre>
        {JSON.stringify(
          permissions,
          null,
          2
        )}
      </pre>

      <hr />

      <p>
        Dashboard:
        {can("dashboard")
          ? " YES"
          : " NO"}
      </p>

      <p>
        Equipment:
        {can("equipment")
          ? " YES"
          : " NO"}
      </p>

      <p>
        Members:
        {can("members")
          ? " YES"
          : " NO"}
      </p>

      <p>
        Administration:
        {can("administration")
          ? " YES"
          : " NO"}
      </p>
    </div>
  );
}