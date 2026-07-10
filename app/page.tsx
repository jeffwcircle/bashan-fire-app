"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardModules from "@/components/dashboard/DashboardModules";
import DepartmentAlerts from "@/components/dashboard/DepartmentAlerts";
import CommandCenter from "@/components/dashboard/CommandCenter";

export default function Home() {
  return (
    <>
      <DashboardHeader userName="Jeff Circle" />

      <CommandCenter />
      <DashboardModules />
    </>
  );
}