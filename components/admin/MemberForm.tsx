"use client";

import { useEffect, useState } from "react";

export interface MemberFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  is_firefighter: boolean;
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

const roles = [
  "Admin",
  "Chief",
  "Assistant Chief",
  "Captain",
  "Lieutenant",
  "Firefighter",
  "Jr Firefighter",
  "Auxiliary",
  "Member",
];

export default function MemberForm({
  initialValues = emptyValues,
  saving = false,
  submitText = "Save Member",
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] =
    useState<MemberFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
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

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!values.first_name.trim()) {
      alert("First name is required.");
      return;
    }

    if (!values.last_name.trim()) {
      alert("Last name is required.");
      return;
    }

    if (!values.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (
      submitText === "Create Member" &&
      !values.password.trim()
    ) {
      alert("Temporary password is required.");
      return;
    }

    await onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 700,
        display: "grid",
        gap: 20,
      }}
    >
      <div>
        <label>First Name</label>

        <input
          value={values.first_name}
          onChange={(e) =>
            update(
              "first_name",
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label>Last Name</label>

        <input
          value={values.last_name}
          onChange={(e) =>
            update(
              "last_name",
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label>Email</label>

        <input
          type="email"
          value={values.email}
          onChange={(e) =>
            update("email", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label>Temporary Password</label>

        <input
          type="password"
          value={values.password}
          onChange={(e) =>
            update(
              "password",
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label>Role</label>

        <select
          value={values.role}
          onChange={(e) =>
            update("role", e.target.value)
          }
          style={inputStyle}
        >
          {roles.map((role) => (
            <option
              key={role}
              value={role}
            >
              {role}
            </option>
          ))}
        </select>
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
          onChange={(e) =>
            update(
              "active",
              e.target.checked
            )
          }
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
          onChange={(e) =>
            update(
              "is_firefighter",
              e.target.checked
            )
          }
        />

        Firefighter (appears on status board)
      </label>

      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <button
          className="btn btn-primary"
          type="submit"
          disabled={saving}
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
  border: "1px solid #d1d5db",
  fontSize: "16px",
} as const;