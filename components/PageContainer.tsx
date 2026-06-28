"use client";

import { ReactNode } from "react";
import AppShell from "./ui/AppShell";

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageContainer({
  children,
  title,
  subtitle,
}: Props) {
  return (
    <AppShell>
      {(title || subtitle) && (
        <div style={{ marginBottom: 24 }}>
          {title && (
            <h1
              style={{
                margin: 0,
                fontSize: 34,
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
                fontSize: 16,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </AppShell>
  );
}