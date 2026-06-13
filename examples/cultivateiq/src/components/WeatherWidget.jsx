import { Sun, Cloud, CloudRain, Wind, Droplets } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "./Card.jsx";
import { Badge } from "./Badge.jsx";
import { useWeatherStation, assessHvacLoad } from "../hooks/useWeatherStation.js";

const CONDITION_ICON = {
  Sunny: Sun,
  "Partly cloudy": Cloud,
  Overcast: Cloud,
  Rain: CloudRain,
};

const Sparkline = ({ points, color, height = 36 }) => {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 160;
  const coords = points
    .map((v, i) => `${(i / (points.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(" ");
  return (
    <svg width={w} height={height} style={{ display: "block" }}>
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};

export const WeatherWidget = ({ stageTarget }) => {
  const { current, trend, source, loading, error } = useWeatherStation();
  const hvac = assessHvacLoad(current, stageTarget);
  const Icon = current ? CONDITION_ICON[current.conditions] || Cloud : Cloud;
  const hvacColor = hvac.level === "high" ? COLORS.danger : hvac.level === "watch" ? COLORS.warning : COLORS.success;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600 }}>Site Weather</div>
        <Badge color={source === "simulated" ? COLORS.textMuted : COLORS.accent}>
          {source === "simulated" ? "Simulated data" : "Local station"}
        </Badge>
      </div>

      {loading && !current && (
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>Connecting to weather feed...</div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: COLORS.danger }}>{error}</div>
      )}

      {current && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            <Icon size={36} color={COLORS.accentText} />
            <div>
              <div style={{ fontSize: 28, fontFamily: FONTS.display, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}>
                {current.tempC}°C
              </div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>{current.conditions}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary }}>
                <Droplets size={13} color={COLORS.purple} /> {current.humidityPct}% RH
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary }}>
                <Wind size={13} color={COLORS.textMuted} /> {current.windKph} km/h {current.windDir}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary }}>
                <CloudRain size={13} color={COLORS.textMuted} /> {current.rainfallMmToday} mm today
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Temp 24h</div>
              <Sparkline points={trend.map((p) => p.tempC)} color={COLORS.accent} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Humidity 24h</div>
              <Sparkline points={trend.map((p) => p.humidityPct)} color={COLORS.purple} />
            </div>
          </div>

          {stageTarget && hvac.message && (
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: `${hvacColor}14`, border: `1px solid ${hvacColor}30`,
            }}>
              <div style={{ fontSize: 10, color: hvacColor, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                HVAC load vs room targets
              </div>
              <div style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.5 }}>{hvac.message}</div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
