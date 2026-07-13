"use client";

import { useEffect, useState } from "react";
import { CloudSun } from "lucide-react";
import { theme } from "@/lib/theme";

interface WeatherData {
  current: {
    temperature: number;
    temperatureUnit: string;
    shortForecast: string;
    windSpeed: string;
    windDirection: string;
  };
}

interface FireWeather {
  fireDanger: string;
}

export default function HeaderConditions() {
  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [fire, setFire] =
    useState<FireWeather | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [weatherRes, fireRes] =
          await Promise.all([
            fetch("/api/weather"),
            fetch("/api/fire-weather"),
          ]);

        setWeather(await weatherRes.json());
        setFire(await fireRes.json());
      } catch (err) {
        console.error(err);
      }
    }

    load();

    const timer = setInterval(
      load,
      15 * 60 * 1000
    );

    return () => clearInterval(timer);
  }, []);

  if (!weather || !fire) {
    return (
      <div
        style={{
          color: theme.colors.textLight,
        }}
      >
        Loading weather...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <WeatherCard
        title="Current"
        value={weather.current.shortForecast}
        icon="🌤"
      />

      <WeatherCard
        title="Temperature"
        value={`${weather.current.temperature}°${weather.current.temperatureUnit}`}
        icon="🌡"
      />

      <WeatherCard
        title="Wind"
        value={`${weather.current.windDirection} ${weather.current.windSpeed}`}
        icon="💨"
      />

      <WeatherCard
        title="Fire Danger"
        value={fire.fireDanger}
        icon="🔥"
        color={
          fire.fireDanger === "EXTREME"
            ? "#dc2626"
            : "#16a34a"
        }
      />
    </div>
  );
}

function WeatherCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color?: string;
}) {
  return (
    <div
      style={{
        minWidth: 120,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 10,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          fontWeight: 600,
        }}
      >
        {icon} {title}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 15,
          fontWeight: 700,
          color: color ?? theme.colors.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}