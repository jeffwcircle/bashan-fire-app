"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./AuthProvider";
import { useProfile } from "./ProfileProvider";

interface Props {
  roles: string[];
  children: ReactNode;
}

export default function RequireRole({
  roles,
  children,
}: Props) {
  const router = useRouter();

  const { user, loading } = useAuth();
  const {
    profile,
    loading: profileLoading,
  } = useProfile();

  useEffect(() => {
    if (loading || profileLoading) return;

    // Not signed in
    if (!user) {
      router.replace("/login");
      return;
    }

    // Signed in but doesn't have permission
    if (!profile || !roles.includes(profile.role)) {
      router.replace("/");
    }
  }, [
    user,
    profile,
    loading,
    profileLoading,
    roles,
    router,
  ]);

  if (loading || profileLoading) {
    return (
      <div style={{ padding: 40 }}>
        Loading...
      </div>
    );
  }

  if (!user || !profile || !roles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}