"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
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

import { theme } from "@/lib/theme";

const menu = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    color: theme.colors.primary,
  },
  {
    name: "Truck Check",
    href: "/truckcheck",
    icon: Truck,
    color: theme.colors.truck,
  },
  {
    name: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    color: theme.colors.maintenance,
  },
  {
    name: "Equipment",
    href: "/equipment",
    icon: Package,
    color: theme.colors.equipment,
  },
  {
    name: "Training",
    href: "/training",
    icon: BookOpen,
    color: theme.colors.training,
  },
  {
    name: "Firefighter Status",
    href: "/tracker",
    icon: Users,
    color: theme.colors.status,
  },
  {
    name: "Administration",
    href: "/admin",
    icon: Settings,
    color: theme.colors.admin,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 80 : 250,
        transition: "width .25s",
        background: theme.colors.sidebar,
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: 25,
        }}
      >
        {!collapsed && (
          <div style={{ textAlign: "center", flex: 1 }}>
            <Image
              src="/images/bashan-patch.png"
              alt="Patch"
              width={105}
              height={105}
              priority
              style={{ margin: "0 auto" }}
            />

            <h2
              style={{
                margin: "14px 0 6px",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              Bashan
              <span style={{ color: theme.colors.primary }}>
                {" "}FireHub
              </span>
            </h2>

            <div
              style={{
                color: "#d1d5db",
                fontSize: 14,
              }}
            >
              Bashan Volunteer Fire Department
            </div>

            <div
              style={{
                color: "#9ca3af",
                fontSize: 12,
                marginTop: 6,
              }}
            >
              Bashan, Ohio
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
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

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 14px",
                textDecoration: "none",
                color: "white",
                borderRadius: theme.radius.md,
                background: active
                  ? item.color
                  : "transparent",
                transition: ".2s",
              }}
            >
              <Icon size={20} />

              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid #374151",
          paddingTop: 20,
          textAlign: "center",
        }}
      >
        {!collapsed && (
          <>
            <div
              style={{
                color: theme.colors.success,
                fontWeight: 700,
              }}
            >
              ● System Ready
            </div>

            <div
              style={{
                marginTop: 8,
                fontWeight: 700,
              }}
            >
              FireHub 3.0
            </div>

            <div
              style={{
                color: "#9ca3af",
                marginTop: 8,
                fontSize: 12,
              }}
            >
              Serving Since 1967
            </div>
          </>
        )}
      </div>
    </aside>
  );
}