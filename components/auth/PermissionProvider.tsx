"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import { useProfile } from "./ProfileProvider";

interface PermissionContextType {
  permissions: string[];
  loading: boolean;
  can: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext =
  createContext<PermissionContextType>({
    permissions: [],
    loading: true,
    can: () => false,
    refreshPermissions: async () => {},
  });

export function PermissionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { profile } = useProfile();

  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshPermissions();
  }, [profile?.role_id]);

  async function refreshPermissions() {
    if (!profile?.role_id) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    console.log("Profile:", profile);
    console.log("Role ID:", profile.role_id);

    // STEP 1 - Load permission IDs for this role
    const {
      data: rolePermissions,
      error: rolePermissionError,
    } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_id", profile.role_id);

    console.log(
      "ROLE PERMISSIONS:",
      rolePermissions
    );
    console.log(
      "ERROR:",
      rolePermissionError
    );

    if (rolePermissionError) {
      console.error(rolePermissionError);

      setPermissions([]);
      setLoading(false);
      return;
    }

    if (!rolePermissions || rolePermissions.length === 0) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    // STEP 2 - Extract permission IDs
    const permissionIds = rolePermissions.map(
      (item: any) => item.permission_id
    );

    console.log(
      "Permission IDs:",
      permissionIds
    );

    // STEP 3 - Load permission keys
    const {
      data: permissionRows,
      error: permissionError,
    } = await supabase
      .from("permissions")
      .select("key")
      .in("id", permissionIds);

    console.log(
      "Permission Rows:",
      permissionRows
    );
    console.log(
      "Permission Error:",
      permissionError
    );

    if (permissionError) {
      console.error(permissionError);

      setPermissions([]);
      setLoading(false);
      return;
    }

    // STEP 4 - Convert into string array
    const permissionKeys =
      permissionRows?.map(
        (row: any) => row.key
      ) ?? [];

    console.log(
      "Permission Keys:",
      permissionKeys
    );

    setPermissions(permissionKeys);

    setLoading(false);
  }

  function can(permission: string) {
    return permissions.includes(permission);
  }

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        can,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}