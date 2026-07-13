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
  tonight: {
    detailedForecast: string;
  };
}

interface FireWeather {
  fireDanger: string;
  humidity: string;
  warning: string;
  recommendation: string;
  burnBan: boolean;
}

export default function Conditions() {
  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [fire, setFire] =
    useState<FireWeather | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const [weatherRes, fireRes] =
        await Promise.all([
          fetch("/api/weather"),
          fetch("/api/fire-weather"),
        ]);

      setWeather(await weatherRes.json());
      setFire(await fireRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const timer = setInterval(
      loadData,
      15 * 60 * 1000
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <CloudSun
          size={24}
          color="#f59e0b"
        />

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Conditions
        </h2>
      </div>

      {loading && (
        <div>Loading...</div>
      )}

      {!loading &&
        weather &&
        fire && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(150px,1fr))",
                gap: 12,
              }}
            >
              <SmallCard
                title="🌤 Current"
                value={
                  weather.current
                    .shortForecast
                }
              />

              <SmallCard
                title="🌡 Temperature"
                value={`${weather.current.temperature}°${weather.current.temperatureUnit}`}
              />

              <SmallCard
                title="💨 Wind"
                value={`${weather.current.windDirection} ${weather.current.windSpeed}`}
              />

              <SmallCard
                title="💧 Humidity"
                value={fire.humidity}
              />

              <SmallCard
                title="🔥 Fire Danger"
                value={fire.fireDanger}
                color={
                  fire.fireDanger ===
                  "EXTREME"
                    ? "#dc2626"
                    : "#16a34a"
                }
              />

              <SmallCard
                title="🚫 Burn Ban"
                value={
                  fire.burnBan
                    ? "ACTIVE"
                    : "None"
                }
                color={
                  fire.burnBan
                    ? "#dc2626"
                    : "#16a34a"
                }
              />

            </div>

<Section
  title="🚨 Fire Weather Warning"
  text={fire.warning}
/>

<Section
  title="🌙 Tonight"
  text={
    weather.tonight
      .detailedForecast
  }
/>

<Section
  title="📝 Recommendation"
  text={
    fire.recommendation
  }
/>          </div>
        )}
    </div>
  );
}

function SmallCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 12,
        background: "#fafafa",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: color ?? "#111827",
          lineHeight: 1.35,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div>
      <div
        style={{
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#4b5563",
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  );
}