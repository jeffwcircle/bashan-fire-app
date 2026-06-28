"use client";

import { ReactNode } from "react";
import AppShell from "./ui/AppShell";

interface Props {
  children: ReactNode;
}

export default function PageContainer({
  children,
}: Props) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}