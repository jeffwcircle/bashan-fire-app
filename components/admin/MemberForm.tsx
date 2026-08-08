"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface MemberFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  is_firefighter: boolean;
}

interface Role {
  id: number;
  name: string;
  description?: string | null;
}

interface Props {
  initialValues?: MemberFormValues;
  saving?: boolean;
  submitText?: string;
  onSubmit: (
    values: MemberFormValues
  ) => Promise<void>;
  onCancel: () => void;
}

const emptyValues: MemberFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "Member",
  active: true,
  is_firefighter: true,
};

export default function MemberForm({
  initialValues = emptyValues,
  saving = false,
  submitText = "Save Member",
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] =
    useState<MemberFormValues>(
      initialValues
    );

  const [roles, setRoles] =
    useState<Role[]>([]);

  const [loadingRoles, setLoadingRoles] =
    useState(true);

  const [roleError, setRoleError] =
    useState<string | null>(null);

  // --------------------------------------------------
  // LOAD ROLES FROM DATABASE
  // --------------------------------------------------

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoadingRoles(true);
      setRoleError(null);

      const {
        data,
        error,
      } = await supabase
        .from("roles")
        .select(
          "id, name, description"
        )
        .order("id", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setRoles(
        (data || []) as Role[]
      );
    } catch (err: any) {
      console.error(
        "Error loading roles:",
        err
      );

      setRoleError(
        err?.message ||
          "Unable to load roles."
      );
    } finally {
      setLoadingRoles(false);
    }
  }

  // --------------------------------------------------
  // UPDATE FORM VALUES
  // --------------------------------------------------

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function update<
    K extends keyof MemberFormValues
  >(
    field: K,
    value: MemberFormValues[K]
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!values.first_name.trim()) {
      alert(
        "First name is required."
      );
      return;
    }

    if (!values.last_name.trim()) {
      alert(
        "Last name is required."
      );
      return;
    }

    if (!values.email.trim()) {
      alert(
        "Email is required."
      );
      return;
    }

    if (
      submitText ===
        "Create Member" &&
      !values.password.trim()
    ) {
      alert(
        "Temporary password is required."
      );
      return;
    }

    if (!values.role) {
      alert(
        "Please select a role."
      );
      return;
    }

    await onSubmit(values);
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 700,
        display: "grid",
        gap: 20,
      }}
    >
      {/* FIRST NAME */}

      <div>
        <label>
          First Name
        </label>

        <input
          value={
            values.first_name
          }
          onChange={(e) =>
            update(
              "first_name",
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      {/* LAST NAME */}

      <div>
        <label>
          Last Name
        </label>

        <input
          value={
            values.last_name
          }
          onChange={(e) =>
            update(
              "last_name",
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      {/* EMAIL */}

      <div>
        <label>
          Email
        </label>

        <input
          type="email"
          value={
            values.email
          }
          onChange={(e) =>
            update(
              "email",
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      {/* PASSWORD */}

      <div>
        <label>
          Temporary Password
        </label>

        <input
          type="password"
          value={
            values.password
          }
          onChange={(e) =>
            update(
              "password",
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      {/* ROLE */}

      <div>
        <label>
          Role
        </label>

        {loadingRoles ? (
          <div
            style={{
              marginTop: 6,
              padding: 12,
              border:
                "1px solid #d1d5db",
              borderRadius: 8,
              color: "#666",
              background:
                "#f9fafb",
            }}
          >
            Loading roles...
          </div>
        ) : roleError ? (
          <div
            style={{
              marginTop: 6,
              padding: 12,
              border:
                "1px solid #fca5a5",
              borderRadius: 8,
              color: "#b91c1c",
              background:
                "#fef2f2",
            }}
          >
            Unable to load roles.

            <div
              style={{
                fontSize: 13,
                marginTop: 4,
              }}
            >
              {roleError}
            </div>

            <button
              type="button"
              onClick={loadRoles}
              style={{
                marginTop: 8,
                padding:
                  "6px 12px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <select
            value={
              values.role
            }
            onChange={(e) =>
              update(
                "role",
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Select a role
            </option>

            {roles.map(
              (role) => (
                <option
                  key={role.id}
                  value={role.name}
                >
                  {role.name}
                </option>
              )
            )}
          </select>
        )}
      </div>

      {/* ACTIVE */}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 600,
        }}
      >
        <input
          type="checkbox"
          checked={
            values.active
          }
          onChange={(e) =>
            update(
              "active",
              e.target.checked
            )
          }
        />

        Active Member
      </label>

      {/* FIREFIGHTER */}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 600,
        }}
      >
        <input
          type="checkbox"
          checked={
            values.is_firefighter
          }
          onChange={(e) =>
            update(
              "is_firefighter",
              e.target.checked
            )
          }
        />

        Firefighter
        (appears on status
        board)
      </label>

      {/* BUTTONS */}

      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <button
          className="btn btn-primary"
          type="submit"
          disabled={
            saving ||
            loadingRoles ||
            roles.length === 0
          }
        >
          {saving
            ? "Saving..."
            : submitText}
        </button>

        <button
          className="btn btn-secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  borderRadius: "8px",
  border:
    "1px solid #d1d5db",
  fontSize: "16px",
} as const;