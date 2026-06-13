import { useState, useEffect } from "react";

// Local weather feed for the facility. If VITE_WEATHER_STATION_URL is set,
// readings come from the on-site weather hardware's LAN endpoint; otherwise a
// simulated QLD Sunshine Coast feed is generated so the UI stays functional.
// Consuming components never branch on the source — they just render the
// normalised shape below (and may show a badge when source === "simulated").

const WEATHER_SOURCE = import.meta.env.VITE_WEATHER_STATION_URL;
const POLL_MS = 60_000;
const TREND_POINTS = 24;

// Map the real station's JSON onto our normalised reading shape:
// { timestamp, tempC, humidityPct, windKph, windDir, rainfallMmToday, conditions }
// Field names differ per vendor (Ecowitt, WeatherFlow Tempest, Davis, ...) —
// fill this in once the installed hardware's schema is known.
function normalizeWeatherPayload(json) {
  return {
    timestamp: json.timestamp || new Date().toISOString(),
    tempC: json.tempC ?? json.temperature ?? null,
    humidityPct: json.humidityPct ?? json.humidity ?? null,
    windKph: json.windKph ?? json.wind_speed ?? null,
    windDir: json.windDir ?? json.wind_dir ?? "",
    rainfallMmToday: json.rainfallMmToday ?? json.rain_today ?? 0,
    conditions: json.conditions ?? "Unknown",
  };
}

// Rough Sunshine Coast monthly mean maxima, used as the simulation baseline.
const MONTHLY_BASE_TEMP = [28, 28, 27, 25, 22, 20, 20, 21, 23, 25, 26, 27];
const WIND_DIRS = ["N", "NE", "E", "ESE", "SE", "S", "SW", "W", "NW"];

function generateSimulatedReading(now) {
  const month = now.getMonth();
  const hour = now.getHours() + now.getMinutes() / 60;
  const base = MONTHLY_BASE_TEMP[month];
  // Diurnal curve peaking ~14:00, trough ~05:00.
  const diurnal = 4 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);
  const jitter = (Math.random() - 0.5) * 1.2;
  const tempC = Math.round((base - 3 + diurnal + jitter) * 10) / 10;
  const humidityPct = Math.round(Math.min(95, Math.max(35, 78 - diurnal * 3 + (Math.random() - 0.5) * 8)));
  const windKph = Math.round(6 + Math.random() * 18);
  const rainfallMmToday = Math.random() < 0.25 ? Math.round(Math.random() * 60) / 10 : 0;
  const conditions =
    rainfallMmToday > 2 ? "Rain" : humidityPct > 80 ? "Overcast" : humidityPct > 65 ? "Partly cloudy" : "Sunny";
  return {
    timestamp: now.toISOString(),
    tempC,
    humidityPct,
    windKph,
    windDir: WIND_DIRS[Math.floor(Math.random() * WIND_DIRS.length)],
    rainfallMmToday,
    conditions,
  };
}

async function fetchWeather() {
  if (WEATHER_SOURCE) {
    const res = await fetch(WEATHER_SOURCE);
    if (!res.ok) throw new Error("Weather station unreachable");
    return { reading: normalizeWeatherPayload(await res.json()), source: "local-station" };
  }
  return { reading: generateSimulatedReading(new Date()), source: "simulated" };
}

function backfillTrend(now) {
  const points = [];
  for (let i = TREND_POINTS - 1; i >= 1; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const r = generateSimulatedReading(t);
    points.push({ timestamp: r.timestamp, tempC: r.tempC, humidityPct: r.humidityPct });
  }
  return points;
}

export function useWeatherStation() {
  const [current, setCurrent] = useState(null);
  const [trend, setTrend] = useState([]);
  const [source, setSource] = useState(WEATHER_SOURCE ? "local-station" : "simulated");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const { reading, source: src } = await fetchWeather();
        if (cancelled) return;
        setCurrent(reading);
        setSource(src);
        setError(null);
        setTrend((prev) => {
          const next = [...prev, { timestamp: reading.timestamp, tempC: reading.tempC, humidityPct: reading.humidityPct }];
          return next.slice(-TREND_POINTS);
        });
      } catch (err) {
        if (!cancelled) setError(err.message || "Weather feed unavailable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setTrend(backfillTrend(new Date()));
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { current, trend, source, loading, error };
}

// Pure comparison of outdoor conditions against the grow room's target band
// for the batch's current stage — flags likely HVAC load.
export function assessHvacLoad(weather, stageTarget) {
  if (!weather || !stageTarget) return { level: "ok", message: "" };
  const issues = [];
  const [tMin, tMax] = stageTarget.tempC;
  const [hMin, hMax] = stageTarget.humidityPct;
  if (weather.tempC > tMax + 4) issues.push(`Outdoor ${weather.tempC}°C well above room target ${tMin}–${tMax}°C — high cooling load expected`);
  else if (weather.tempC > tMax || weather.tempC < tMin - 6) issues.push(`Outdoor ${weather.tempC}°C outside room target ${tMin}–${tMax}°C — monitor HVAC duty cycle`);
  if (weather.humidityPct > hMax + 15) issues.push(`Outdoor humidity ${weather.humidityPct}% well above target ${hMin}–${hMax}% — elevated dehumidification load`);
  else if (weather.humidityPct > hMax + 5) issues.push(`Outdoor humidity ${weather.humidityPct}% above target ${hMin}–${hMax}% — watch dehumidifiers`);
  if (issues.length === 0) return { level: "ok", message: "Outdoor conditions within comfortable range of room targets." };
  const severe = issues.some((m) => m.includes("well above"));
  return { level: severe ? "high" : "watch", message: issues.join(". ") };
}
