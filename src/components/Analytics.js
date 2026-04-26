import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, CategoryScale, LinearScale,
  PointElement, Tooltip, Legend, Filler,
} from "chart.js";
import { FaChartLine } from "react-icons/fa";
import PowerDistributionCard from "./PowerDistributionCard";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randF = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

/* ── Shared chart options ── */
const mkOpts = (color) => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 10 }, maxTicksLimit: 6 } },
    y: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
  },
  elements: { point: { radius: 2.5, hoverRadius: 5, borderWidth: 2 } },
  animation: { duration: 350 },
});

/* ── Progress bar component ── */
function ProgressBar({ value, max = 100, color }) {
  return (
    <div style={{ background: "var(--slate-100)", borderRadius: 8, height: 6, overflow: "hidden", marginTop: 10 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ height: "100%", background: color, borderRadius: 8 }}
      />
    </div>
  );
}

/* ── Efficiency gauge card ── */
function EfficiencyCard({ pue, avgTemp }) {
  const target   = 1.2;
  const score    = Math.max(0, Math.round(100 - (pue - target) * 60 - (avgTemp > 32 ? 15 : 0)));
  const col      = score >= 75 ? "#22c55e" : score >= 50 ? "#f97316" : "#ef4444";
  const lbl      = score >= 75 ? "Excellent" : score >= 50 ? "Good" : "Needs Work";
  const r = 36, circ = 2 * Math.PI * r;

  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border-color)",
      padding: "22px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
      height: "100%", justifyContent: "space-between", boxSizing: "border-box"
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--slate-600)", alignSelf: "flex-start" }}>
        ⚙️ Efficiency Score
      </div>

      {/* large ring */}
      <div style={{ position: "relative", width: 90, height: 90 }}>
        <svg width={90} height={90} viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={45} cy={45} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7} />
          <motion.circle
            cx={45} cy={45} r={r} fill="none" stroke={col} strokeWidth={7}
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: col }}>{score}</span>
          <span style={{ fontSize: 10, color: "var(--slate-500)", marginTop: 1 }}>/ 100</span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: col }}>{lbl}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>PUE {pue} · Target ≤ 1.2</div>
      </div>

      {/* PUE progress toward target */}
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--slate-500)", marginBottom: 4 }}>
          <span>Current PUE</span><span>Ideal: 1.0</span>
        </div>
        <div style={{ background: "var(--slate-100)", borderRadius: 8, height: 8, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, ((pue - 1) / 0.8) * 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", background: col, borderRadius: 8 }}
          />
        </div>
      </div>

      {/* quick stats */}
      {[
        { label: "Cooling Impact", value: avgTemp > 32 ? "High" : "Low", col: avgTemp > 32 ? "#f97316" : "#22c55e" },
        { label: "Energy Rating",  value: score >= 75 ? "A+" : score >= 50 ? "B" : "C", col },
      ].map(s => (
        <div key={s.label} style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          padding: "7px 12px", background: "var(--slate-50)",
          borderRadius: 8, border: "1px solid var(--border-color)",
        }}>
          <span style={{ fontSize: 12, color: "var(--slate-500)" }}>{s.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: s.col }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.4, ease: "easeOut" } }),
};

/* ════════════════════════
   Main Analytics Page
════════════════════════ */
export default function Analytics() {
  const mkDs = (label, color, alpha) => ({
    labels: [],
    datasets: [{ label, data: [], borderColor: color, backgroundColor: `${color}${alpha}`, fill: true, tension: 0.45 }],
  });

  const [cpuData,  setCpuData]  = useState(mkDs("CPU %",       "#22c55e", "18"));
  const [tempData, setTempData] = useState(mkDs("Temp °C",     "#f97316", "12"));
  const [pueData,  setPueData]  = useState(mkDs("PUE",         "#a855f7", "15"));

  const [stats,    setStats]    = useState({
    maxCPU: 0, minCPU: 100, avgCPU: 0,
    maxTemp: 0, minTemp: 100, avgTemp: 0,
    latestPUE: 0, avgPUE: 0,
  });

  const cpuArr  = useRef([]);
  const tempArr = useRef([]);
  const pueArr  = useRef([]);

  const push = (prev, val, max = 12) => {
    const labels = [...prev.labels, new Date().toLocaleTimeString()];
    const data   = [...prev.datasets[0].data, val];
    if (labels.length > max) { labels.shift(); data.shift(); }
    return { ...prev, labels, datasets: [{ ...prev.datasets[0], data }] };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const cpu  = rand(38, 95);
      const temp = rand(20, 40);
      const pue  = randF(1.1, 1.6);

      cpuArr.current.push(cpu);
      tempArr.current.push(temp);
      pueArr.current.push(pue);

      setCpuData(prev  => push(prev, cpu));
      setTempData(prev => push(prev, temp));
      setPueData(prev  => push(prev, pue));

      const ca = cpuArr.current, ta = tempArr.current, pa = pueArr.current;
      setStats({
        maxCPU:  Math.max(...ca), minCPU: Math.min(...ca),
        avgCPU:  Math.round(ca.reduce((a, b) => a + b, 0) / ca.length),
        maxTemp: Math.max(...ta), minTemp: Math.min(...ta),
        avgTemp: +(ta.reduce((a, b) => a + b, 0) / ta.length).toFixed(1),
        latestPUE: pue,
        avgPUE: +(pa.reduce((a, b) => a + b, 0) / pa.length).toFixed(2),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /* ── Top quick-stat chips ── */
  const quickStats = [
    { label: "Max CPU",   value: `${stats.maxCPU}%`,     col: "#ef4444", bg: "#fef2f2",   border: "#fecaca" },
    { label: "Avg CPU",   value: `${stats.avgCPU}%`,     col: "#22c55e", bg: "var(--green-50)", border: "#bbf7d0" },
    { label: "Min CPU",   value: `${stats.minCPU}%`,     col: "#3b82f6", bg: "#eff6ff",   border: "#bfdbfe" },
    { label: "Max Temp",  value: `${stats.maxTemp}°C`,   col: "#ef4444", bg: "#fef2f2",   border: "#fecaca" },
    { label: "Avg Temp",  value: `${stats.avgTemp}°C`,   col: "#f97316", bg: "#fff7ed",   border: "#fed7aa" },
    { label: "Avg PUE",   value: stats.avgPUE,           col: "#a855f7", bg: "#faf5ff",   border: "#e9d5ff" },
  ];

  const statCards = [
    {
      label: "Peak CPU Load",
      value: `${stats.maxCPU}%`,
      icon: "⚡",
      sub: `Avg: ${stats.avgCPU}% · Min: ${stats.minCPU}%`,
      color: "#22c55e", bg: "var(--green-50)",
      progress: stats.maxCPU, max: 100, progressColor: "#22c55e",
    },
    {
      label: "Temperature Range",
      value: `${stats.avgTemp}°C`,
      icon: "🌡️",
      sub: `${stats.minTemp}°C – ${stats.maxTemp}°C recorded`,
      color: "#f97316", bg: "#fff7ed",
      progress: stats.avgTemp, max: 45, progressColor: "#f97316",
    },
    {
      label: "Efficiency Status",
      value: stats.avgTemp > 32 ? "⚠ Degraded" : "✅ Optimal",
      icon: "🔍",
      sub: stats.avgTemp > 32 ? "Cooling system optimization recommended" : "System running within efficient bounds",
      color: stats.avgTemp > 32 ? "#f97316" : "#22c55e",
      bg: stats.avgTemp > 32 ? "#fff7ed" : "var(--green-50)",
      progress: stats.avgTemp > 32 ? 45 : 85, max: 100,
      progressColor: stats.avgTemp > 32 ? "#f97316" : "#22c55e",
    },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="page-title">
          <FaChartLine style={{ color: "var(--purple-500)" }} /> Analytics
        </div>
        <div className="page-subtitle">Trend analysis · Efficiency evaluation · Real-time insights</div>
      </motion.div>

      {/* ── Quick Stat Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 22 }}
      >
        {quickStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
            style={{
              background: s.bg, borderRadius: 10, border: `1px solid ${s.border}`,
              padding: "11px 14px",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: s.col, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginTop: 3 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Row 1: CPU | Temp | Power Distribution ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.82fr", gap: 18, marginBottom: 18 }}>
        {[
          { title: "CPU Usage Trend",    badge: "CPU %", badgeCls: "",     data: cpuData  },
          { title: "Temperature Trend",  badge: "°C",    badgeCls: "temp", data: tempData },
        ].map((c, i) => (
          <motion.div key={c.title} className="chart-card"
            style={{ display: "flex", flexDirection: "column" }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.1, duration: 0.4 }}
          >
            <div className="chart-card-header">
              <div className="chart-card-title">{c.title}</div>
              <span className={`chart-badge ${c.badgeCls}`}>{c.badge}</span>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Line data={c.data} options={mkOpts()} />
            </div>
          </motion.div>
        ))}

        {/* Power Distribution */}
        <motion.div className="chart-card"
          style={{ display: "flex", flexDirection: "column" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">Power Distribution</div>
          </div>
          <PowerDistributionCard />
        </motion.div>
      </div>

      {/* ── Charts Row 2: PUE Trend | Efficiency Card ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.82fr", gap: 18, marginBottom: 22 }}>
        {/* PUE Over Time */}
        <motion.div className="chart-card"
          style={{ display: "flex", flexDirection: "column" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">🔋 PUE Over Time</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 11, color: "var(--slate-500)", fontWeight: 500,
                background: "var(--slate-50)", border: "1px solid var(--border-color)",
                padding: "2px 10px", borderRadius: 20,
              }}>
                Target ≤ 1.2
              </span>
              <span className="chart-badge" style={{ background: "#faf5ff", color: "#a855f7", borderColor: "#e9d5ff" }}>
                PUE
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Line data={pueData} options={{
              ...mkOpts(),
              scales: {
                ...mkOpts().scales,
                y: {
                  ...mkOpts().scales.y,
                  min: 1.0, max: 1.8,
                  ticks: { color: "#94a3b8", font: { size: 10 }, stepSize: 0.2 },
                },
              },
            }} />
          </div>
          <div style={{
            marginTop: 12, padding: "10px 14px",
            background: "#faf5ff", borderRadius: 8, border: "1px solid #e9d5ff",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 12.5, color: "#64748b" }}>Current PUE</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#a855f7" }}>
              {stats.latestPUE || "—"}
            </span>
            <span style={{ fontSize: 12.5, color: "#64748b" }}>Session Avg</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#475569" }}>
              {stats.avgPUE || "—"}
            </span>
          </div>
        </motion.div>

        {/* Efficiency gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <EfficiencyCard pue={stats.latestPUE || 1.3} avgTemp={stats.avgTemp} />
        </motion.div>
      </div>

      {/* ── Bottom Stat Cards ── */}
      <div className="analytics-cards">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="chart-card"
            custom={i} variants={cardVariants}
            initial="hidden" animate="visible"
            whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
            style={{ borderTop: `3px solid ${s.color}`, background: s.bg }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div className="analytics-stat-value" style={{ color: s.color, fontSize: 28 }}>
              {s.value}
            </div>
            <div className="analytics-stat-label">{s.label}</div>
            <div className="analytics-stat-insight">{s.sub}</div>
            <ProgressBar value={s.progress} max={s.max} color={s.progressColor} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}