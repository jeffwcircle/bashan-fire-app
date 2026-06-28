"use client";

import Link from "next/link";
import image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

import {
  Menu,
  Home,
  Truck,
  Wrench,
  Package,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Truck Check",
    href: "/truckcheck",
    icon: Truck,
  },
  {
    name: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
  },
  {
    name: "Equipment",
    href: "/equipment",
    icon: Package,
  },
  {
    name: "Training",
    href: "/training",
    icon: BookOpen,
  },
  {
    name: "Firefighter Status",
    href: "/tracker",
    icon: Users,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Settings,
  },
];

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#eef2f7",
      }}
    >
      <aside
        style={{
          width: collapsed ? 78 : 220,
          transition: ".25s",
          background: "#1f2937",
          color: "white",
          padding: 18,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          {!collapsed && (

<div
  style={{
    lineHeight: 1.2,
  }}
>

  <div
    style={{
      fontSize: 13,
      color: "#9ca3af",
      marginTop: 6,
    }}
  >
    Fire Management System
  </div>
</div>

          )}

          <button
            onClick={() =>
              setCollapsed(
                !collapsed
              )
            }
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            {collapsed ? (
              <ChevronRight />
            ) : (
              <ChevronLeft />
            )}
          </button>
        </div>

        {menu.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px",
                marginBottom: 8,
                borderRadius: 12,
                textDecoration: "none",
                color: "white",
                background: active
                  ? "#991b1b"
                  : "transparent",
transform: active
  ? "translateX(4px)"
  : "none",
borderLeft: active
  ? "5px solid #ffffff"
  : "5px solid transparent",

boxShadow: active
  ? "0 8px 20px rgba(0,0,0,.25)"
  : "none",
                transition: ".2s",
              }}
            >
              <Icon size={20} />

              {!collapsed && (
                <span>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}

<div
  style={{
    marginTop: "auto",
    paddingTop: 30,
    borderTop: "1px solid #374151",
    color: "#9ca3af",
    fontSize: 13,
  }}
>
  {!collapsed && (
    <>
      <div>🟢 System Ready</div>

      <div style={{ marginTop: 6 }}>
        Bashan Fire v2
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 11,
        }}
      >
        Fire Management System
      </div>
    </>
  )}
</div>


      </aside>

      <main
        style={{
          flex: 1,
          padding: 30,
        }}
      >
        {children}
      </main>
    </div>
  );
}