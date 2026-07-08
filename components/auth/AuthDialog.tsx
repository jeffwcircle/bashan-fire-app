"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { theme } from "@/lib/theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AuthDialog({
  open,
  onClose,
}: Props) {
  const router = useRouter();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          zIndex: 999,
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 420,
          background: "white",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
          zIndex: 1000,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Lock
              size={34}
              color={theme.colors.primary}
            />
          </div>
        </div>

        <h2
          style={{
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          Sign In Required
        </h2>

        <p
          style={{
            color: theme.colors.textLight,
            lineHeight: 1.5,
            marginBottom: 28,
          }}
        >
          You must be signed in to create,
          edit, or delete department records.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              router.push("/login");
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </>
  );
}