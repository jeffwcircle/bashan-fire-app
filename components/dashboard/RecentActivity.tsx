"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { History } from "lucide-react";

import { db } from "@/lib/firebase";
import { theme } from "@/lib/theme";

interface Activity {
  id: string;
  text: string;
  date: Date;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const all: Activity[] = [];

    function update() {
      all.sort(
        (a, b) =>
          b.date.getTime() - a.date.getTime()
      );

      setActivities(all.slice(0, 20));
    }

    const equipmentUnsub = onSnapshot(
      query(
        collection(db, "equipmentInventory"),
        orderBy("createdAt", "desc"),
        limit(10)
      ),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data: any = doc.data();

          return {
            id: `equipment-${doc.id}`,
            text: `🚒 Added equipment: ${data.name}`,
            date:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
          };
        });

        all.splice(
          0,
          all.filter((a) =>
            a.id.startsWith("equipment-")
          ).length,
          ...items
        );

        update();
      }
    );

    const maintenanceUnsub = onSnapshot(
      query(
        collection(db, "maintenanceRecords"),
        orderBy("createdAt", "desc"),
        limit(10)
      ),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data: any = doc.data();

          return {
            id: `maintenance-${doc.id}`,
            text: `🔧 Maintenance completed`,
            date:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
          };
        });

        const filtered = all.filter(
          (a) =>
            !a.id.startsWith("maintenance-")
        );

        filtered.push(...items);

        all.length = 0;
        all.push(...filtered);

        update();
      }
    );

    return () => {
      equipmentUnsub();
      maintenanceUnsub();
    };
  }, []);

  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 24,
        height: 360,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          flexShrink: 0,
        }}
      >
        <History
          size={24}
          color={theme.colors.primary}
        />

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Recent Activity
        </h2>
      </div>

      {activities.length === 0 ? (
        <div
          style={{
            color: theme.colors.textLight,
          }}
        >
          No recent activity.
        </div>
      ) : (
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            paddingRight: 8,
          }}
        >
          {activities.map(
            (activity, index) => (
              <div
                key={activity.id}
                style={{
                  padding: "10px 0",
                  borderBottom:
                    index ===
                    activities.length - 1
                      ? "none"
                      : "1px solid #eee",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {activity.text}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color:
                      theme.colors
                        .textLight,
                    marginTop: 2,
                  }}
                >
                  {activity.date.toLocaleString()}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}