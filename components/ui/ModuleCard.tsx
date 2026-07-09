"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { theme } from "@/lib/theme";

interface Props {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: ReactNode;

  locked?: boolean;
  badge?: string;
}

export default function ModuleCard({
  title,
  description,
  href,
  color,
  icon,
  locked = false,
  badge,
}: Props) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
      }}
    >
      <div
onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-6px)";
  e.currentTarget.style.boxShadow = `0 14px 35px ${color}40`;
e.currentTarget.style.border = `1px solid ${color}`;
}}

        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = theme.shadow.card;
e.currentTarget.style.border = "1px solid transparent";
        }}
        style={{
          background: theme.colors.surface,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadow.card,
          overflow: "hidden",
          transition: "all .2s ease",
          cursor: "pointer",

          opacity: locked ? 0.82 : 1,
          position: "relative",
        }}
      >
        {/* Color Bar */}

        <div
          style={{
            height: 8,
            background: color,
          }}
        />

        {/* Lock */}

        {locked && (
          <div
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#fff3cd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Lock
              size={18}
              color="#b45309"
            />
          </div>
        )}

        <div
          style={{
            padding: 28,
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 52,
              marginBottom: 12,
            }}
          >
            {icon}
          </div>

          <h2
            style={{
              fontSize: 26,
              margin: 0,
              color: theme.colors.text,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              color: theme.colors.textLight,
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 24,
            }}
          >
            {badge && (
              <div
                style={{
                  display: "inline-block",
                  background: "#f3f4f6",
                  color: "#374151",
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {badge}
              </div>
            )}

<div
  style={{
    color: locked ? "#6b7280" : color,
    fontWeight: 700,
  }}
>
  {locked ? "Restricted" : "Open →"}
</div>
          </div>
        </div>
      </div>
    </Link>
  );
}