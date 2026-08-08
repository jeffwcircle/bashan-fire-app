"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import RequirePermission from "@/components/auth/RequirePermission";

interface Role {
  id: number;
  name: string;
  description?: string | null;
}

interface Permission {
  id: number;
  key: string;
  module: string;
  description?: string | null;
}

interface RolePermission {
  role_id: number;
  permission_id: number;
}

export default function PermissionsPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] =
    useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] =
    useState<RolePermission[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  // --------------------------------------------------
  // ADD ROLE FORM
  // --------------------------------------------------

  const [showAddRole, setShowAddRole] =
    useState(false);

  const [newRoleId, setNewRoleId] =
    useState("");

  const [newRoleName, setNewRoleName] =
    useState("");

  const [newRoleDescription, setNewRoleDescription] =
    useState("");

  // --------------------------------------------------
  // ADD PERMISSION FORM
  // --------------------------------------------------

  const [showAddPermission, setShowAddPermission] =
    useState(false);

  const [newPermissionId, setNewPermissionId] =
    useState("");

  const [newPermissionKey, setNewPermissionKey] =
    useState("");

  const [newPermissionModule, setNewPermissionModule] =
    useState("");

  const [newPermissionDescription, setNewPermissionDescription] =
    useState("");

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // LOAD ROLES
      const {
        data: roleData,
        error: roleError,
      } = await supabase
        .from("roles")
        .select(
          "id, name, description"
        )
        .order("id");

      if (roleError) {
        throw roleError;
      }

      // LOAD PERMISSIONS
      const {
        data: permissionData,
        error: permissionError,
      } = await supabase
        .from("permissions")
        .select(
          "id, key, module, description"
        )
        .order("id");

      if (permissionError) {
        throw permissionError;
      }

      // LOAD ROLE PERMISSIONS
      const {
        data: rolePermissionData,
        error: rolePermissionError,
      } = await supabase
        .from("role_permissions")
        .select(
          "role_id, permission_id"
        );

      if (rolePermissionError) {
        throw rolePermissionError;
      }

      setRoles(
        (roleData || []) as Role[]
      );

      setPermissions(
        (permissionData || []) as Permission[]
      );

      setRolePermissions(
        (rolePermissionData ||
          []) as RolePermission[]
      );
    } catch (err: any) {
      console.error(
        "Error loading permissions:",
        err
      );

      setError(
        err?.message ||
          "Unable to load permissions."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // CHECK PERMISSION
  // --------------------------------------------------

  function hasPermission(
    roleId: number,
    permissionId: number
  ) {
    return rolePermissions.some(
      (item) =>
        Number(item.role_id) ===
          Number(roleId) &&
        Number(item.permission_id) ===
          Number(permissionId)
    );
  }

  // --------------------------------------------------
  // TOGGLE PERMISSION
  // --------------------------------------------------

  async function togglePermission(
    roleId: number,
    permissionId: number
  ) {
    const currentlyHasPermission =
      hasPermission(
        roleId,
        permissionId
      );

    const savingKey =
      `${roleId}-${permissionId}`;

    setSaving(savingKey);

    try {
      if (currentlyHasPermission) {
        // REMOVE PERMISSION

        const {
          error: deleteError,
        } = await supabase
          .from("role_permissions")
          .delete()
          .eq(
            "role_id",
            roleId
          )
          .eq(
            "permission_id",
            permissionId
          );

        if (deleteError) {
          throw deleteError;
        }

        setRolePermissions(
          (current) =>
            current.filter(
              (item) =>
                !(
                  Number(
                    item.role_id
                  ) ===
                    Number(roleId) &&
                  Number(
                    item.permission_id
                  ) ===
                    Number(permissionId)
                )
            )
        );
      } else {
        // ADD PERMISSION

        const {
          error: insertError,
        } = await supabase
          .from("role_permissions")
          .insert({
            role_id: roleId,
            permission_id:
              permissionId,
          });

        if (insertError) {
          throw insertError;
        }

        setRolePermissions(
          (current) => [
            ...current,
            {
              role_id: roleId,
              permission_id:
                permissionId,
            },
          ]
        );
      }
    } catch (err: any) {
      console.error(
        "Error changing permission:",
        err
      );

      alert(
        err?.message ||
          "Unable to change permission."
      );
    } finally {
      setSaving(null);
    }
  }

  // --------------------------------------------------
  // ADD ROLE
  // --------------------------------------------------

  async function addRole() {
    const name =
      newRoleName.trim();

    const description =
      newRoleDescription.trim();

    if (!name) {
      alert(
        "Please enter a role name."
      );
      return;
    }

    try {
      setSaving("new-role");

      const insertData: {
        name: string;
        description?: string;
        id?: number;
      } = {
        name,
      };

      if (description) {
        insertData.description =
          description;
      }

      if (newRoleId.trim()) {
        const id =
          Number(
            newRoleId.trim()
          );

        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {
          alert(
            "Role ID must be a positive whole number."
          );
          return;
        }

        insertData.id = id;
      }

      const {
        data,
        error: insertError,
      } = await supabase
        .from("roles")
        .insert(insertData)
        .select(
          "id, name, description"
        )
        .single();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setRoles(
          (current) =>
            [
              ...current,
              data as Role,
            ].sort(
              (a, b) =>
                a.id - b.id
            )
        );
      }

      // RESET FORM

      setNewRoleId("");
      setNewRoleName("");
      setNewRoleDescription("");
      setShowAddRole(false);
} catch (err: any) {
  console.error("Error adding role:", err);
  console.error("Error message:", err?.message);
  console.error("Error details:", err?.details);
  console.error("Error hint:", err?.hint);
  console.error("Error code:", err?.code);

  alert(
    err?.message ||
      err?.details ||
      "Unable to add role. Check the browser console for details."
  );
}  }

  // --------------------------------------------------
  // ADD PERMISSION
  // --------------------------------------------------

  async function addPermission() {
    const key =
      newPermissionKey.trim();

    const module =
      newPermissionModule.trim();

    const description =
      newPermissionDescription.trim();

    if (!key) {
      alert(
        "Please enter a permission key."
      );
      return;
    }

    if (!module) {
      alert(
        "Please enter a module."
      );
      return;
    }

    try {
      setSaving("new-permission");

      const insertData: {
        key: string;
        module: string;
        description?: string;
        id?: number;
      } = {
        key,
        module,
      };

      if (description) {
        insertData.description =
          description;
      }

      if (
        newPermissionId.trim()
      ) {
        const id =
          Number(
            newPermissionId.trim()
          );

        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {
          alert(
            "Permission ID must be a positive whole number."
          );
          return;
        }

        insertData.id = id;
      }

      const {
        data,
        error: insertError,
      } = await supabase
        .from("permissions")
        .insert(insertData)
        .select(
          "id, key, module, description"
        )
        .single();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setPermissions(
          (current) =>
            [
              ...current,
              data as Permission,
            ].sort(
              (a, b) =>
                a.id - b.id
            )
        );
      }

      // RESET FORM

      setNewPermissionId("");
      setNewPermissionKey("");
      setNewPermissionModule("");
      setNewPermissionDescription("");
      setShowAddPermission(false);
    } catch (err: any) {
      console.error(
        "Error adding permission:",
        err
      );

      alert(
        err?.message ||
          "Unable to add permission."
      );
    } finally {
      setSaving(null);
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <RequirePermission permission="administration">
        <div
          style={{
            padding: 30,
          }}
        >
          <h1>
            Permission Management
          </h1>

          <p>
            Loading permissions...
          </p>
        </div>
      </RequirePermission>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <RequirePermission permission="administration">
        <div
          style={{
            padding: 30,
          }}
        >
          <button
            onClick={() =>
              router.push("/admin")
            }
            style={{
              padding: "8px 14px",
              marginBottom: 20,
            }}
          >
            ← Back to Admin
          </button>

          <h1>
            Permission Management
          </h1>

          <div
            style={{
              padding: 20,
              background: "#ffebee",
              border:
                "1px solid #ef9a9a",
              borderRadius: 8,
              color: "#b71c1c",
            }}
          >
            <strong>
              Unable to load permissions
            </strong>

            <p>{error}</p>
          </div>
        </div>
      </RequirePermission>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <RequirePermission permission="administration">
      <div
        style={{
          padding: 20,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            marginBottom: 20,
            gap: 20,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
              }}
            >
              🔐 Permission Management
            </h1>

            <p
              style={{
                color: "#666",
                marginTop: 8,
              }}
            >
              Manage which permissions
              are available to each
              role.
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/admin")
            }
            style={{
              padding:
                "10px 16px",
              whiteSpace:
                "nowrap",
            }}
          >
            ← Admin
          </button>
        </div>

        {/* ACTION BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <button
            onClick={() =>
              setShowAddRole(
                !showAddRole
              )
            }
            style={{
              padding:
                "10px 16px",
              background:
                "#374151",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight:
                "bold",
            }}
          >
            {showAddRole
              ? "Cancel"
              : "+ Add Role"}
          </button>

          <button
            onClick={() =>
              setShowAddPermission(
                !showAddPermission
              )
            }
            style={{
              padding:
                "10px 16px",
              background:
                "#374151",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight:
                "bold",
            }}
          >
            {showAddPermission
              ? "Cancel"
              : "+ Add Permission"}
          </button>
        </div>

        {/* ==========================================
            ADD ROLE FORM
        ========================================== */}

        {showAddRole && (
          <div
            style={{
              border:
                "1px solid #d1d5db",
              borderRadius: 10,
              padding: 18,
              marginBottom: 20,
              background:
                "#f9fafb",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 15,
              }}
            >
              Add Role
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "120px 1fr 2fr",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginBottom: 5,
                  }}
                >
                  ID
                </label>

                <input
                  type="number"
                  value={newRoleId}
                  onChange={(e) =>
                    setNewRoleId(
                      e.target.value
                    )
                  }
                  placeholder="Auto"
                  style={{
                    width: "100%",
                    padding: 9,
                    border:
                      "1px solid #ccc",
                    borderRadius: 5,
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginBottom: 5,
                  }}
                >
                  Role Name
                </label>

                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) =>
                    setNewRoleName(
                      e.target.value
                    )
                  }
                  placeholder="Jr Firefighter"
                  style={{
                    width: "100%",
                    padding: 9,
                    border:
                      "1px solid #ccc",
                    borderRadius: 5,
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginBottom: 5,
                  }}
                >
                  Description
                </label>

                <input
                  type="text"
                  value={
                    newRoleDescription
                  }
                  onChange={(e) =>
                    setNewRoleDescription(
                      e.target.value
                    )
                  }
                  placeholder="Description of this role"
                  style={{
                    width: "100%",
                    padding: 9,
                    border:
                      "1px solid #ccc",
                    borderRadius: 5,
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>
            </div>

            <button
              onClick={addRole}
              disabled={
                saving === "new-role"
              }
              style={{
                marginTop: 15,
                padding:
                  "9px 18px",
                background:
                  "#166534",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor:
                  saving ===
                  "new-role"
                    ? "wait"
                    : "pointer",
                fontWeight:
                  "bold",
              }}
            >
              {saving ===
              "new-role"
                ? "Adding..."
                : "Add Role"}
            </button>
          </div>
        )}

        {/* ==========================================
            ADD PERMISSION FORM
        ========================================== */}

        {showAddPermission && (
          <div
            style={{
              border:
                "1px solid #d1d5db",
              borderRadius: 10,
              padding: 18,
              marginBottom: 20,
              background:
                "#f9fafb",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 15,
              }}
            >
              Add Permission
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "100px 1.5fr 1fr 2fr",
                gap: 12,
              }}
            >
              {/* ID */}

              <div>
                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginBottom: 5,
                  }}
                >
                  ID
                </label>

                <input
                  type="number"
                  value={
                    newPermissionId
                  }
                  onChange={(e) =>
                    setNewPermissionId(
                      e.target.value
                    )
                  }
                  placeholder="21"
                  style={{
                    width: "100%",
                    padding: 9,
                    border:
                      "1px solid #ccc",
                    borderRadius: 5,
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* KEY */}

              <div>
                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginBottom: 5,
                  }}
                >
                  Permission Key
                </label>

                <input
                  type="text"
                  value={
                    newPermissionKey
                  }
                  onChange={(e) =>
                    setNewPermissionKey(
                      e.target.value
                    )
                  }
                  placeholder="truck_checks_edit"
                  style={{
                    width: "100%",
                    padding: 9,
                    border:
                      "1px solid #ccc",
                    borderRadius: 5,
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* MODULE */}

              <div>
                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginBottom: 5,
                  }}
                >
                  Module
                </label>

                <input
                  type="text"
                  value={
                    newPermissionModule
                  }
                  onChange={(e) =>
                    setNewPermissionModule(
                      e.target.value
                    )
                  }
                  placeholder="Truck Checks"
                  style={{
                    width: "100%",
                    padding: 9,
                    border:
                      "1px solid #ccc",
                    borderRadius: 5,
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginBottom: 5,
                  }}
                >
                  Description
                </label>

                <input
                  type="text"
                  value={
                    newPermissionDescription
                  }
                  onChange={(e) =>
                    setNewPermissionDescription(
                      e.target.value
                    )
                  }
                  placeholder="Allows editing a truck check"
                  style={{
                    width: "100%",
                    padding: 9,
                    border:
                      "1px solid #ccc",
                    borderRadius: 5,
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>
            </div>

            <button
              onClick={
                addPermission
              }
              disabled={
                saving ===
                "new-permission"
              }
              style={{
                marginTop: 15,
                padding:
                  "9px 18px",
                background:
                  "#166534",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor:
                  saving ===
                  "new-permission"
                    ? "wait"
                    : "pointer",
                fontWeight:
                  "bold",
              }}
            >
              {saving ===
              "new-permission"
                ? "Adding..."
                : "Add Permission"}
            </button>
          </div>
        )}

        {/* INFORMATION */}

        <div
          style={{
            background: "#e3f2fd",
            border:
              "1px solid #90caf9",
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
          }}
        >
          <strong>
            How to use this page
          </strong>

          <p
            style={{
              margin:
                "5px 0 0 0",
            }}
          >
            Check a box to give a role
            a permission. Uncheck it to
            remove the permission.
            Changes are saved immediately.
          </p>
        </div>

        {/* ==========================================
            PERMISSION GRID
        ========================================== */}

        <div
          style={{
            width: "100%",
            overflowX: "auto",
            border:
              "1px solid #ccc",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                `240px repeat(${roles.length}, 60px)`,

              width: "max-content",

              minWidth: "100%",
            }}
          >
            {/* PERMISSION HEADER */}

            <div
              style={{
                position: "sticky",
                left: 0,
                top: 0,
                zIndex: 20,

                height: 150,

                display: "flex",
                alignItems:
                  "center",

                padding:
                  "0 12px",

                background:
                  "#374151",

                color: "white",

                fontWeight:
                  "bold",

                borderRight:
                  "1px solid #555",

                borderBottom:
                  "2px solid #1f2937",

                boxSizing:
                  "border-box",

                boxShadow:
                  "3px 0 6px rgba(0,0,0,0.15)",
              }}
            >
              Permission
            </div>

            {/* ROLE HEADERS */}

            {roles.map(
              (role) => (
                <div
                  key={role.id}
                  style={{
                    height: 150,

                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",

                    background:
                      "#374151",

                    color: "white",

                    borderRight:
                      "1px solid #555",

                    borderBottom:
                      "2px solid #1f2937",

                    boxSizing:
                      "border-box",

                    writingMode:
                      "vertical-rl",

                    transform:
                      "rotate(180deg)",

                    fontWeight:
                      "bold",

                    fontSize: 14,

                    padding:
                      "8px 0",
                  }}
                >
                  {role.name}
                </div>
              )
            )}

            {/* PERMISSION ROWS */}

            {permissions.map(
              (permission) => (
                <PermissionRow
                  key={
                    permission.id
                  }
                  permission={
                    permission
                  }
                  roles={roles}
                  hasPermission={
                    hasPermission
                  }
                  saving={
                    saving
                  }
                  onToggle={
                    togglePermission
                  }
                />
              )
            )}
          </div>
        </div>

        {/* EMPTY STATES */}

        {roles.length ===
          0 && (
          <div
            style={{
              padding: 20,
              textAlign: "center",
            }}
          >
            No roles were found.
          </div>
        )}

        {permissions.length ===
          0 && (
          <div
            style={{
              padding: 20,
              textAlign: "center",
            }}
          >
            No permissions were found.
          </div>
        )}
      </div>
    </RequirePermission>
  );
}

// ==================================================
// PERMISSION ROW
// ==================================================

interface PermissionRowProps {
  permission: Permission;
  roles: Role[];

  hasPermission: (
    roleId: number,
    permissionId: number
  ) => boolean;

  saving: string | null;

  onToggle: (
    roleId: number,
    permissionId: number
  ) => void;
}

function PermissionRow({
  permission,
  roles,
  hasPermission,
  saving,
  onToggle,
}: PermissionRowProps) {
  return (
    <>
      {/* PERMISSION NAME */}

      <div
        style={{
          position: "sticky",
          left: 0,
          zIndex: 10,

          minHeight: 48,

          display: "flex",
          flexDirection:
            "column",
          justifyContent:
            "center",

          padding:
            "5px 10px",

          background:
            "#ffffff",

          borderRight:
            "1px solid #ddd",

          borderBottom:
            "1px solid #ddd",

          boxSizing:
            "border-box",

          boxShadow:
            "3px 0 6px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            fontWeight:
              "bold",
            fontSize: 14,
            lineHeight: 1.1,
          }}
        >
          {permission.key}
        </div>

        {permission.description && (
          <div
            style={{
              fontSize: 11,
              color: "#777",
              marginTop: 2,
              lineHeight: 1.1,
            }}
          >
            {
              permission.description
            }
          </div>
        )}

        <div
          style={{
            fontSize: 9,
            color: "#aaa",
            marginTop: 2,
          }}
        >
          ID:{" "}
          {permission.id}
        </div>
      </div>

      {/* ROLE CHECKBOXES */}

      {roles.map(
        (role) => {
          const checked =
            hasPermission(
              role.id,
              permission.id
            );

          const savingKey =
            `${role.id}-${permission.id}`;

          const isSaving =
            saving ===
            savingKey;

          return (
            <div
              key={role.id}
              style={{
                minHeight: 48,

                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",

                borderRight:
                  "1px solid #ddd",

                borderBottom:
                  "1px solid #ddd",

                background:
                  checked
                    ? "#f0fdf4"
                    : "#fff",

                boxSizing:
                  "border-box",
              }}
            >
              <input
                type="checkbox"
                checked={
                  checked
                }
                disabled={
                  isSaving
                }
                onChange={() =>
                  onToggle(
                    role.id,
                    permission.id
                  )
                }
                style={{
                  width: 20,
                  height: 20,
                  cursor:
                    isSaving
                      ? "wait"
                      : "pointer",
                  margin: 0,
                }}
              />
            </div>
          );
        }
      )}
    </>
  );
}