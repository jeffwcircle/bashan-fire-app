"use client";

import DepartmentAlerts from "./DepartmentAlerts";
import Conditions from "./Conditions";
import RecentActivity from "./RecentActivity";
import UpcomingEvents from "./UpcomingEvents";

export default function CommandCenter() {
  return (
    <div
      style={{
        maxWidth: "1600px",
        width: "100%",
        margin: "0 auto",
        padding: "0 6%",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        marginBottom: 40,
      }}
    >
      {/* Alerts + Conditions */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px,1fr))",
          gap: 24,
        }}
      >
        <DepartmentAlerts />
      </div>

      {/* Activity + Events */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px,1fr))",
          gap: 24,
        }}
      >
        <RecentActivity />
        <UpcomingEvents />
      </div>
    </div>
  );
}