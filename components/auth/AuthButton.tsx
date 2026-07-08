"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function AuthButton({
  children,
  onClick,
  className,
  style,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();

  function handleClick() {
    if (!user) {
      router.push("/login");
      return;
    }

    onClick?.();
  }

  return (
    <button
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}