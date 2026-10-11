
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface MemberFormValues {
  first_name: string;
  last_name: string;
  username?: string;
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
  onSubmit: (values: MemberFormValues) => Promise<void>;
  onCancel: () => void;
}

const emptyValues: MemberFormValues = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  role: "Member",
  active: true,
  is_firefighter: true,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "16px",
} as const;

export default function MemberForm({
  initialValues,
  saving = false,
  submitText = "Save Member",
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<MemberFormValues>(
    initialValues ?? emptyValues
  );

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleError, setRoleError] = useState<string | null>(null);

  const creatingMember =
    initialValues === undefined || submitText === "Create Member";

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoadingRoles(true);
      setRoleError(null);

      const { data, error } = await supabase
        .from("roles")
        .select("id, name, description")
        .order("id", { ascending: true });

      if (error) throw error;

      setRoles((data || []) as Role[]);
    } catch (err: unknown) {
      console.error("Error loading roles:", err);
      setRoleError(
        err instanceof Error ? err.message : "Unable to load roles."
      );
    } finally {
      setLoadingRoles(false);
    }
  }

  useEffect(() => {
    setValues(initialValues ?? emptyValues);
  }, [initialValues]);

  function update<K extends keyof MemberFormValues>(
    field: K,
    value: MemberFormValues[K]
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!values.first_name.trim()) {
      alert("First name is required.");
      return;
    }

    if (!values.last_name.trim()) {
      alert("Last name is required.");
      return;
    }

    if (creatingMember && !values.username?.trim()) {
      alert("Username is required.");
      return;
    }

    if (!values.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (creatingMember && !values.password.trim()) {
      alert("Temporary password is required.");
      return;
    }

    if (values.password && values.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (!values.role) {
      alert("Please select a role.");
      return;
    }

    await onSubmit({
      ...values,
      username: values.username?.trim().toLowerCase() || "",
      email: values.email.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 700, display: "grid", gap: 20 }}
    >
      <div>
        <label>First Name</label>
        <input
          value={values.first_name}
          onChange={(e) => update("first_name", e.target.value)}
          style={inputStyle}
          autoComplete="given-name"
          required
        />
      </div>

      <div>
        <label>Last Name</label>
        <input
          value={values.last_name}
          onChange={(e) => update("last_name", e.target.value)}
          style={inputStyle}
          autoComplete="family-name"
          required
        />
      </div>

      <div>
        <label>Username</label>
        <input
          type="text"
          value={values.username ?? ""}
          onChange={(e) => update("username", e.target.value)}
          style={inputStyle}
          autoComplete="off"
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9._-]+"
          title="Use 3–30 letters, numbers, periods, underscores, or hyphens."
          placeholder="e.g. engine71"
          required={creatingMember}
        />
        <small style={{ color: "#666" }}>
          Used to sign in. Letters, numbers, periods, underscores, and hyphens only.
        </small>
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          style={inputStyle}
          autoComplete="email"
          required
        />
      </div>

      {creatingMember ? (
        <div>
          <label>Temporary Password</label>
          <input
            type="password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            style={inputStyle}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <small style={{ color: "#666" }}>
            Set the initial password for this new member.
          </small>
        </div>
      ) : (
        <div>
          <label>New Password (optional)</label>
          <input
            type="password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            style={inputStyle}
            autoComplete="new-password"
            minLength={6}
            placeholder="Leave blank to keep the current password"
          />
          <small style={{ color: "#666" }}>
            Leave blank if you do not want to change this member's password.
          </small>
        </div>
      )}

      <div>
        <label>Role</label>

        {loadingRoles ? (
          <div
            style={{
              marginTop: 6,
              padding: 12,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              color: "#666",
              background: "#f9fafb",
            }}
          >
            Loading roles...
          </div>
        ) : roleError ? (
          <div
            style={{
              marginTop: 6,
              padding: 12,
              border: "1px solid #fca5a5",
              borderRadius: 8,
              color: "#b91c1c",
              background: "#fef2f2",
            }}
          >
            Unable to load roles.
            <div style={{ fontSize: 13, marginTop: 4 }}>{roleError}</div>
            <button
              type="button"
              onClick={loadRoles}
              style={{ marginTop: 8, padding: "6px 12px", cursor: "pointer" }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <select
            value={values.role}
            onChange={(e) => update("role", e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        )}
      </div>

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
          checked={values.active}
          onChange={(e) => update("active", e.target.checked)}
        />
        Active Member
      </label>

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
          checked={values.is_firefighter}
          onChange={(e) => update("is_firefighter", e.target.checked)}
        />
        Firefighter (appears on status board)
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={saving || loadingRoles || roles.length === 0}
        >
          {saving ? "Saving..." : submitText}
        </button>

        <button
          className="btn btn-secondary"
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
