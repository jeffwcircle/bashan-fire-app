"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardModules from "@/components/dashboard/DashboardModules";
import DashboardSearch from "@/components/dashboard/DashboardSearch";

export default function Home() {
  return (
    <>
      <DashboardHeader userName="Jeff Circle" />

      <DashboardModules />
    </>
  );
}