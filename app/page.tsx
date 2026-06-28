"use client";

import { useRouter } from "next/navigation";

type DashboardCard = {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
};

export default function Home() {
  const router = useRouter();



  const cards: DashboardCard[] = [
    {
      title: "Truck Checks",
      subtitle: "Monthly apparatus inspections",
      icon: "🚒",
      color: "#b91c1c",
      route: "/truckcheck",
    },
    {
      title: "Equipment",
      subtitle: "Equipment check logs",
      icon: "🧰",
      color: "#ea580c",
      route: "/equipment",
    },
    {
      title: "Maintenance",
      subtitle: "Vehicle maintenance records",
      icon: "🛠️",
      color: "#2563eb",
      route: "/maintenance",
    },
    {
      title: "Training",
      subtitle: "Department training logs",
      icon: "📘",
      color: "#16a34a",
      route: "/training",
    },
    {
      title: "Firefighter Status",
      subtitle: "Firefighter availability",
      icon: "👨‍🚒",
      color: "#7c3aed",
      route: "/tracker",
    },
    {
      title: "Ice Cream Social",
      subtitle: "Fundraiser management",
      icon: "🍦",
      color: "#ec4899",
      route: "/icecreamsocial",
    },
    {
      title: "Administration",
      subtitle: "Templates & settings",
      icon: "⚙️",
      color: "#374151",
      route: "/admin",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eef2f7",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg,#991b1b 0%,#7f1d1d 100%)",
          color: "white",
          padding: "48px 24px",
          boxShadow: "0 6px 20px rgba(0,0,0,.2)",
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: 20,
              opacity: .9,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Bashan Volunteer Fire Department
          </div>

          <h1
            style={{
              margin: "10px 0",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            Fire Management System
          </h1>

          <p
            style={{
              fontSize: 18,
              opacity: .9,
              maxWidth: 700,
            }}
          >
            Welcome to the department dashboard. Select a module below to
            manage inspections, maintenance, training, equipment, firefighter
            status and administration.
          </p>
        </div>
      </div>



      <div
        style={{
          maxWidth: 1300,
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))",
            gap: 24,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => router.push(card.route)}
              style={{
                background: "white",
                borderRadius: 18,
                padding: 28,
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                transition: "all .2s ease",
                borderTop: `6px solid ${card.color}`,
              }}
            >
              <div
                style={{
                  fontSize: 46,
                  marginBottom: 20,
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              >
                {card.title}
              </div>

              <div
                style={{
                  marginTop: 10,
                  color: "#6b7280",
                  lineHeight: 1.6,
                }}
              >
                {card.subtitle}
              </div>

              <div
                style={{
                  marginTop: 30,
                  color: card.color,
                  fontWeight: 700,
                }}
              >
                Open Module →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}