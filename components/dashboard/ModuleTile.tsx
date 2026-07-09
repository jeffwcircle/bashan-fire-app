"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import ModuleCard from "@/components/ui/ModuleCard";
import AuthDialog from "@/components/auth/AuthDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/components/auth/ProfileProvider";
import {
  canAccessAdmin,
  canEdit,
} from "@/lib/permissions";

interface Props {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: React.ReactNode;
  permission?: "public" | "member" | "admin";
}

export default function ModuleTile({
  title,
  description,
  href,
  color,
  icon,
  permission = "public",
}: Props) {
  const router = useRouter();

  const { user } = useAuth();
  const { profile } = useProfile();

  const [showDialog, setShowDialog] =
    useState(false);

  let allowed = true;

  switch (permission) {
    case "member":
      allowed =
        !!user &&
        canEdit(profile?.role);
      break;

    case "admin":
      allowed =
        !!user &&
        canAccessAdmin(profile?.role);
      break;
  }

  function handleClick() {
    if (!allowed) {
      setShowDialog(true);
      return;
    }

    router.push(href);
  }

  return (
    <>
      <div onClick={handleClick}>
<ModuleCard
  title={title}
  description={description}
  href="#"
  color={color}
  icon={icon}
  locked={!allowed}
  badge={
    !allowed
      ? permission === "admin"
        ? "Administrator Only"
        : "Member Access"
      : undefined
  }
/>
      </div>

      <AuthDialog
        open={showDialog}
        onClose={() =>
          setShowDialog(false)
        }
      />
    </>
  );
}