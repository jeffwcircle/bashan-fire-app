"use client";

import React from "react";

import AppShell from "@/components/ui/AppShell";
import TopBar from "@/components/ui/TopBar";

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageContainer({
  children,
  title,
  subtitle,
  action,
}: Props) {

return (
  <AppShell>
<TopBar
  userName="Jeff Circle"
  onLogout={() => {
    window.location.href = "/login";
  }}
/>
    <main
      style={{
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
        }}
      >
        {(title || subtitle || action) && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 30,
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              {title && (
                <h1
                  style={{
                    margin: 0,
                    fontSize: "2rem",
                    color: "#991b1b",
                    fontWeight: 700,
                  }}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  style={{
                    marginTop: 8,
                    color: "#6b7280",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {action}
          </div>
        )}

        {children}
      </div>
    </main>
  </AppShell>
);

}