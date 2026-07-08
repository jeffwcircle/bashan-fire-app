"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  LogIn,
  LogOut,
} from "lucide-react";

import { theme } from "@/lib/theme";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/components/auth/ProfileProvider";

export default function TopBar() {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : "Guest";

  const role = profile?.role ?? "Guest";

  return (
    <header
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: "18px 24px",
        marginBottom: 24,
        boxShadow: theme.shadow.card,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          Welcome to FireHub
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: theme.colors.textLight,
            marginTop: 6,
          }}
        >
          <CalendarDays size={16} />
          {today}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Bell
          size={20}
          color={theme.colors.textLight}
        />

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: theme.colors.text,
            }}
          >
            {loading ? "Loading..." : displayName}
          </div>

          <div
            style={{
              fontSize: 12,
              color: theme.colors.textLight,
            }}
          >
            {role}
          </div>
        </div>

        {user ? (
          <button
            onClick={signOut}
            className="btn btn-primary"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="btn btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LogIn size={16} />
            Login
          </Link>
        )}
      </div>
    </header>
  );
}