"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardModules from "@/components/dashboard/DashboardModules";
import CommandCenter from "@/components/dashboard/CommandCenter";

import { useProfile } from "@/components/auth/ProfileProvider";

export default function Home() {
  const { profile } = useProfile();

  return (
    <>
      <DashboardHeader
        userName={
          profile
            ? `${profile.first_name} ${profile.last_name}`
            : undefined
        }
      />

      <CommandCenter />

      <DashboardModules />
    </>
  );
}