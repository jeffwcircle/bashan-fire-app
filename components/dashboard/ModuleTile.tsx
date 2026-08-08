"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
   *
   * All other modules are controlled by
   * the RBAC permission system.
   */
  const allowed =
    permission === "public"
      ? true
      : !loading && can(permission);

  /*
   * Handle module click.
   *
   * If the user has permission:
   *   → Open the module.
   *
   * If the user does not have permission:
   *   → Show the login dialog.
   */
  function handleClick() {
    if (!allowed) {
      setShowDialog(true);
      return;
    }

    router.push(href);
  }

  /*
   * Show the lock while permissions are
   * loading or when the user doesn't have
   * the required permission.
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

      {/* LOGIN DIALOG */}

      <AuthDialog
        open={showDialog}
        onClose={() =>
          setShowDialog(false)
        }
      />
    </>
  );
}