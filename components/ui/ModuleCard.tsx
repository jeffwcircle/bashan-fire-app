"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { theme } from "@/lib/theme";

interface Props {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: ReactNode;
}

export default function ModuleCard({
  title,
  description,
  href,
  color,
  icon,
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
  e.currentTarget.style.boxShadow = theme.shadow.hover;
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = theme.shadow.card;
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
        }}
      >
        <div
          style={{
            height: 8,
            background: color,
          }}
        />

<div
  style={{
    padding: 28,
    display: "flex",
    flexDirection: "column",
    flex: 1,
  }}
>          <div
            style={{
              fontSize: 52,
              marginBottom: 12,
            }}
          >
            {icon}
          </div>

          <h2
            style={{
	      fontSize:26,
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
              color: color,
              fontWeight: 700,
            }}
          >
            Open →
          </div>
        </div>
      </div>
    </Link>
  );
}