"use client";

import { ReactNode, useState } from "react";
import { Lock } from "lucide-react";

import { useAuth } from "./AuthProvider";
import AuthDialog from "./AuthDialog";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export default function ProtectedButton({
  children,
  onClick,
  className,
  style,
  disabled = false,
}: Props) {
  const { user } = useAuth();

  const [showDialog, setShowDialog] = useState(false);

  function handleClick() {
    if (disabled) return;

    if (!user) {
      setShowDialog(true);
      return;
    }

    onClick?.();
  }

  return (
    <>
      <button
        className={className}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          ...style,
        }}
        onClick={handleClick}
      >
        {!user && <Lock size={16} />}

        {children}
      </button>

      <AuthDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
}