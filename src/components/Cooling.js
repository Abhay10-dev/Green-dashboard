import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, CategoryScale, LinearScale,
  PointElement, Tooltip, Legend, Filler
} from "chart.js";
import { FaSnowflake, FaThermometerHalf, FaServer, FaExclamationTriangle } from "react-icons/fa";
import { useSettings } from "../SettingsContext";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const randF = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
  scales: {
    x: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 10 }, maxTicksLimit: 6 } },
    y: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
  },
  elements: { point: { radius: 2.5, hoverRadius: 5, borderWidth: 2 } },
  animation: { duration: 350 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }),
};

export default function Cooling() {
  const { settings } = useSettings();
  const [data, setData] = useState({
    avgTemp: 28,
    coolingEffic: 88,
    servers: [],
  });

  const [trend, setTrend] = useState({
    labels: [],
    datasets: [{
      label: "Average Temp (°C)",
      data: [],
      borderColor: "#f97316",
      backgroundColor: "rgba(249, 115, 22, 0.15)",
      fill: true, tension: 0.4,
    }],
  });

  const push = (prev, val) => {
    const labels = [...prev.labels, new Date().toLocaleTimeString()];
    const d = [...prev.datasets[0].data, val];
    if (labels.length > 12) { labels.shift(); d.shift(); }
    return { ...prev, labels, datasets: [{ ...prev.datasets[0], data: d }] };
  };

  useEffect(() => {
    if (!settings.autoRefresh) return;

    const int = setInterval(() => {
      const avg = randF(25.0, 38.0);
      const servs = Array.from({ length: 6 }).map((_, i) => {
        // High chance of overheating for simulation
        const base = i === 2 && Math.random() > 0.5 ? rand(34, 45) : rand(22, 34);
        return { name: `Node-${i + 1}`, temp: base };
      }).sort((a, b) => b.temp - a.temp); // highest temp first
      
      const effic = avg > settings.tempLimit ? rand(50, 65) : avg > settings.tempLimit - 5 ? rand(65, 80) : rand(80, 95);

      setData({ avgTemp: avg, servers: servs, coolingEffic: effic });
      setTrend(prev => push(prev, avg));
    }, settings.refreshInterval * 1000);

    return () => clearInterval(int);
  }, [settings.autoRefresh, settings.refreshInterval, settings.tempLimit]);

  // Adjust display temperature if Fahrenheit is selected in Settings
  const displayTemp = (t) => settings.tempUnit === "F" ? (t * 9/5 + 32).toFixed(1) : t.toFixed(1);
  const tempSym = `°${settings.tempUnit}`;

  const isAlert = data.avgTemp > settings.tempLimit;
  const sysState = isAlert ? "Overloaded" : data.avgTemp > settings.tempLimit - 5 ? "Active" : "Idle";
  const stateCol = isAlert ? "#ef4444" : data.avgTemp > settings.tempLimit - 5 ? "#f97316" : "#22c55e";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-title">
          <FaSnowflake style={{ color: "var(--blue-400)" }} /> Cooling Module
        </div>
        <div className="page-subtitle">Thermal tracking, cooling efficiency, and heat map monitoring.</div>
      </motion.div>

      {/* ── Alerts Banner ── */}
      <AnimatePresence>
        {settings.alertsEnabled && isAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }}
            style={{
              background: "#fef2f2", borderLeft: "4px solid #ef4444", borderRadius: 8,
              padding: "16px 20px", color: "#b91c1c", marginBottom: 20, display: "flex", alignItems: "center", gap: 12,
              fontWeight: 600, fontSize: 14, boxShadow: "0 2px 5px rgba(239, 68, 68, 0.1)"
            }}
          >
            <FaExclamationTriangle style={{ fontSize: 18 }} />
            CRITICAL: Average temperature exceeds safe limits ({settings.tempLimit}{tempSym}). Cooling systems are overloaded. Immediate action required.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI Strip ── */}
      <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
        {[
          { label: "Average Temperature", value: `${displayTemp(data.avgTemp)}${tempSym}`, icon: <FaThermometerHalf />, col: isAlert ? "red" : "orange", detail: isAlert ? "High Risk" : "Stable" },
          { label: "Cooling System State", value: sysState, icon: <FaSnowflake />, col: isAlert ? "red" : "blue", detail: "HVAC Status", valCol: stateCol },
          { label: "Cooling Efficiency", value: `${data.coolingEffic}%`, icon: <FaServer />, col: "green", detail: "Heat vs Cooling Load" },
        ].map((c, i) => (
          <motion.div key={c.label} className="card kpi-card" custom={i} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}>
            <div className="kpi-top">
              <div className={`kpi-icon ${c.col}`}>{c.icon}</div>
              <span className="chart-badge">{c.detail}</span>
            </div>
            <div className="kpi-value" style={{ marginTop: 12, marginBottom: 4, color: c.valCol || "inherit" }}>{c.value}</div>
            <div className="kpi-label">{c.label}</div>
            {c.label === "Cooling Efficiency" && (
              <div style={{ background: "var(--slate-100)", height: 6, borderRadius: 5, marginTop: 10, overflow: "hidden" }}>
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${data.coolingEffic}%` }} transition={{ duration: 0.5 }}
                  style={{ height: "100%", background: data.coolingEffic < 60 ? "#ef4444" : "#22c55e" }} 
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        {/* Trend Line */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ display: "flex", flexDirection: "column" }}>
          <div className="chart-card-header">
            <div className="chart-card-title">📈 Temperature Over Time</div>
          </div>
          <div style={{ height: 300, marginTop: 10, flex: 1 }}>
            <Line data={trend} options={chartOpts} />
          </div>
        </motion.div>

        {/* Server Heat Map */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ display: "flex", flexDirection: "column" }}>
          <div className="chart-card-header">
            <div className="chart-card-title">🔥 Server Heat Monitoring</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {data.servers.map(s => {
              const isHot = s.temp > settings.tempLimit;
              return (
                <div key={s.name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", background: isHot ? "#7f1d1d" : "var(--slate-50)",
                  border: `1px solid ${isHot ? "#991b1b" : "var(--border-color)"}`, borderRadius: 10
                }}>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", fontSize: 14 }}>{s.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 800, color: isHot ? "#ef4444" : "#22c55e" }}>{displayTemp(s.temp)}{tempSym}</span>
                    {isHot && <FaExclamationTriangle color="#ef4444" />}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
