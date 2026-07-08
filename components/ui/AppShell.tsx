"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { theme } from "@/lib/theme";

interface Props {
  children: ReactNode;
  userName?: string;
  onLogout?: () => void;
}

export default function AppShell({
  children,
  userName = "Jeff Circle",
  onLogout,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.colors.background,
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 24,
          }}
        >
          <TopBar />

          {children}
        </div>
      </div>
    </div>
  );
}