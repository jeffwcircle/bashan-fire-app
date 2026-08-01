"use client";

import { useState } from "react";

interface Props {
  memberId: string;
  memberName: string;
  open: boolean;
  onClose: () => void;
}

export default function ResetPasswordDialog({
  memberId,
  memberName,
  open,
  onClose,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function resetPassword() {
    if (password.length < 8) {
      alert(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: memberId,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.error);
        return;
      }

      alert(
        `Password reset successfully for ${memberName}.`
      );

      setPassword("");
      setConfirmPassword("");

      onClose();
    } catch (err) {
      console.error(err);

      alert("Unable to reset password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="card"
        style={{
          width: 420,
          padding: 24,
        }}
      >
        <h2>Reset Password</h2>

        <p>
          {memberName}
        </p>

        <div style={{ marginTop: 20 }}>
          <label>
            New Temporary Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <label>
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 28,
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            disabled={saving}
            onClick={resetPassword}
          >
            {saving
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #d1d5db",
} as const;