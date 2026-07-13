import { NextResponse } from "next/server";

const LAT = 39.5187;
const LON = -81.8015;

export async function GET() {
  try {
    // Get NOAA grid information
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${LAT},${LON}`,
      {
        headers: {
          "User-Agent": "Bashan FireHub",
          Accept: "application/geo+json",
        },
        next: {
          revalidate: 900, // 15 minutes
        },
      }
    );

    if (!pointResponse.ok) {
      throw new Error("Unable to reach NOAA");
    }

    const point = await pointResponse.json();

    // Get forecast
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

    if (!forecastResponse.ok) {
      throw new Error("Unable to load forecast");
    }

    const forecast =
      await forecastResponse.json();

    const periods =
      forecast.properties.periods;

    return NextResponse.json({
      current: periods[0],
      tonight: periods[1],
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          "Unable to retrieve weather.",
      },
      {
        status: 500,
      }
    );
  }
}