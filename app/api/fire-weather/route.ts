import { NextResponse } from "next/server";

const LAT = 39.5187;
const LON = -81.8015;

export async function GET() {
  try {
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${LAT},${LON}`,
      {
        headers: {
          "User-Agent": "Bashan FireHub",
          Accept: "application/geo+json",
        },
        next: {
          revalidate: 900,
        },
      }
    );

    if (!pointResponse.ok) {
      throw new Error("Unable to contact NOAA.");
    }

    const point = await pointResponse.json();

    const forecastResponse = await fetch(
      point.properties.forecast,
      {
        headers: {
          "User-Agent": "Bashan FireHub",
          Accept: "application/geo+json",
        },
        next: {
          revalidate: 900,
        },
      }
    );

    const forecast =
      await forecastResponse.json();

    const forecastText =
      forecast.properties.periods[0]
        .detailedForecast ?? "";

    const alertsResponse = await fetch(
      `https://api.weather.gov/alerts/active?point=${LAT},${LON}`,
      {
        headers: {
          "User-Agent": "Bashan FireHub",
          Accept: "application/geo+json",
        },
        next: {
          revalidate: 900,
        },
      }
    );

    const alerts = await alertsResponse.json();

    const warning =
      alerts.features.find((a: any) => {
        const event =
          a.properties.event ?? "";

        return (
          event.includes("Red Flag") ||
          event.includes("Fire Weather")
        );
      }) ?? null;

    const humidityMatch =
      forecastText.match(
        /humidity.*?(\d+)\s?%/i
      );

    return NextResponse.json({
      fireDanger: warning
        ? "EXTREME"
        : "Normal",

      humidity: humidityMatch
        ? `${humidityMatch[1]}%`
        : "--",

      warning: warning
        ? warning.properties.event
        : "None",

      recommendation: warning
        ? "Avoid open burning."
        : "Conditions acceptable.",

      burnBan: false,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        fireDanger: "--",
        humidity: "--",
        warning: "Unavailable",
        recommendation:
          "Unavailable",
        burnBan: false,
      },
      {
        status: 200,
      }
    );
  }
}