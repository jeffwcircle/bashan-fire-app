"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import ModuleCard from "@/components/ui/ModuleCard";
import AuthDialog from "@/components/auth/AuthDialog";
import { usePermissions } from "@/components/auth/PermissionProvider";

interface Props {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: React.ReactNode;
  permission?: string;
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

  const { loading, can } = usePermissions();

  const [showDialog, setShowDialog] =
    useState(false);

  /*
   * Public modules are always available.
   * Everything else is checked against RBAC.
   */
  const allowed =
    permission === "public"
      ? true
      : !loading && can(permission);

  function handleClick() {
    if (!allowed) {
      setShowDialog(true);
      return;
    }

    router.push(href);
  }

  /*
   * While permissions are loading, don't
   * accidentally show a module as available.
   */
  const isLocked =
    permission !== "public" && !allowed;

  return (
    <>
      <div onClick={handleClick}>
        <ModuleCard
          title={title}
          description={description}
          href="#"
          color={color}
          icon={icon}
          locked={isLocked}
          badge={
            isLocked
              ? "Access Restricted"
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