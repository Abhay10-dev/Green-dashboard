import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, CategoryScale, LinearScale,
  PointElement, Tooltip, Legend, Filler,
} from "chart.js";
import { FaServer, FaBolt, FaThermometerHalf, FaTachometerAlt, FaLeaf } from "react-icons/fa";
import PowerDistributionCard from "./PowerDistributionCard";
import { useMetrics } from "../MetricsContext";
import { useSettings } from "../SettingsContext";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

/* ── Mini SVG Sparkline ── */
function MiniSparkline({ data, color }) {
  if (!data || data.length < 2) return <div style={{ height: 30 }} />;
  const w = 100, h = 30;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 5) - 2;
    return `${x},${y}`;
  }).join(" ");
  const fill = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polygon points={fill} fill={`${color}18`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Green Score Ring ── */
function GreenRing({ score }) {
  const r = 22, circ = 2 * Math.PI * r;
  const col = score >= 75 ? "#22c55e" : score >= 50 ? "#f97316" : "#ef4444";
  return (
    <div style={{ position: "relative", width: 58, height: 58, flexShrink: 0 }}>
      <svg width={58} height={58} viewBox="0 0 58 58" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={29} cy={29} r={r} fill="none" stroke="#f1f5f9" strokeWidth={5} />
        <motion.circle
          cx={29} cy={29} r={r} fill="none" stroke={col} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: col,
      }}>
        {score}
      </div>
    </div>
  );
}

/* ── Chart options ── */
const mkOpts = () => ({
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

/* ── Min/Max/Avg chip row ── */
function StatChips({ items }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
      {items.map(s => (
        <div key={s.label} style={{
          flex: 1, background: "var(--slate-50)", borderRadius: 8, border: "1px solid var(--border-color)",
          padding: "6px 10px", textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "var(--slate-500)", marginBottom: 2 }}>{s.label}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: s.col }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }),
};

/* ════════════════════════
   Main Dashboard
═══════════════════════ */
export default function Dashboard() {
  const { metrics, timeSeries } = useMetrics();
  const { settings } = useSettings();
  const { facility, derived, servers } = metrics;

  const mkDataset = (label, dataArr, color, alpha) => ({
    labels: timeSeries.labels,
    datasets: [{
      label, data: dataArr,
      borderColor: color,
      backgroundColor: `${color}${alpha}`,
      fill: true, tension: 0.45,
    }],
  });

  const cpuData  = mkDataset("CPU %", timeSeries.cpu, "#22c55e", "18");
  const tempData = mkDataset("Temp °C", timeSeries.temp, "#f97316", "12");

  const avgTemp = timeSeries.temp[timeSeries.temp.length - 1] || 0;
  const tempAlert = avgTemp > settings.tempLimit;

  let minCpu = 0, maxCpu = 0, avgCpu = 0;
  let minTemp = 0, maxTemp = 0, avgTempSummary = 0;
  if (timeSeries.cpu.length) {
    minCpu = Math.min(...timeSeries.cpu);
    maxCpu = Math.max(...timeSeries.cpu);
    avgCpu = Math.round(timeSeries.cpu.reduce((a, b) => a + b, 0) / timeSeries.cpu.length);
    minTemp = Math.min(...timeSeries.temp);
    maxTemp = Math.max(...timeSeries.temp);
    avgTempSummary = +(timeSeries.temp.reduce((a, b) => a + b, 0) / timeSeries.temp.length).toFixed(1);
  }

  const kpi = {
    servers: servers.length,
    power: facility.totalPower,
    temp: avgTemp,
    pue: derived.pue,
    greenScore: derived.greenScore,
  };

  const formatTemp = (val) => settings.tempUnit === "F" ? (val * 9/5 + 32).toFixed(1) : val.toFixed(1);
  const tSym = `°${settings.tempUnit}`;
  
  const formatKW = (val) => settings.energyUnit === "MW" ? (val / 1000).toFixed(3) : val.toFixed(2);
  const eSym = settings.energyUnit;

  const insights = {
    energySaved: derived.energySaved.toFixed(1),
    co2Reduced: (derived.energySaved * 0.4).toFixed(1), // dummy correlation
    uptime: derived.uptime,
  };

  const greenCol   = kpi.greenScore >= 75 ? "#22c55e" : kpi.greenScore >= 50 ? "#f97316" : "#ef4444";
  const greenLabel = kpi.greenScore >= 75 ? "Excellent" : kpi.greenScore >= 50 ? "Good" : "Needs Work";

  const topCards = [
    { label: "Total Servers",   value: kpi.servers,              icon: <FaServer />,          color: "green",  badge: "All active",                        badgeType: "up",      spark: timeSeries.cpu.slice(-8), sparkColor: "#22c55e" },
    { label: "Power Usage",     value: `${formatKW(kpi.power)} ${eSym}`, icon: <FaBolt />,           color: "blue",   badge: kpi.power > settings.powerLimit ? "High" : "Normal",  badgeType: kpi.power > settings.powerLimit ? "down" : "up", spark: timeSeries.power.slice(-8), sparkColor: "#3b82f6" },
    { label: "Avg Temperature", value: `${formatTemp(kpi.temp)}${tSym}`, icon: <FaThermometerHalf />, color: "orange", badge: tempAlert ? "⚠ High" : "Normal", badgeType: tempAlert ? "down" : "neutral", spark: timeSeries.temp.slice(-8), sparkColor: "#f97316" },
    { label: "PUE Score",       value: kpi.pue,         icon: <FaTachometerAlt />,   color: "purple", badge: kpi.pue < 1.3 ? "Excellent" : kpi.pue < 1.5 ? "Good" : "Fair", badgeType: kpi.pue < 1.3 ? "up" : "neutral", spark: timeSeries.pue.slice(-8), sparkColor: "#a855f7" },
  ];

  return (
    <div>
      {/* ── Header + Green Score ── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <div className="page-title">
            <FaLeaf style={{ color: "var(--green-500)" }} /> Dashboard
          </div>
          <div className="page-subtitle">Real-time data center metrics · Updates every 2s</div>
        </div>

        {/* Green Score pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "var(--bg-card)", border: "1px solid var(--border-color)",
            borderRadius: 14, padding: "10px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <GreenRing score={kpi.greenScore} />
          <div>
            <div style={{ fontSize: 11, color: "var(--slate-500)", fontWeight: 500, marginBottom: 2 }}>Green Score</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: greenCol }}>{greenLabel}</div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Temperature Alert ── */}
      <AnimatePresence>
        {tempAlert && (
          <motion.div
            className="alert-banner"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            🌡️ <strong>Temperature Alert:</strong>&nbsp;Average temperature exceeded {formatTemp(settings.tempLimit)}{tSym} — check cooling systems.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI Cards ── */}
      <div className="cards" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        {topCards.map((c, i) => (
          <motion.div
            key={c.label}
            className="card kpi-card"
            custom={i} variants={cardVariants}
            initial="hidden" animate="visible"
            whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
          >
            <div className="kpi-top">
              <div className={`kpi-icon ${c.color}`}>{c.icon}</div>
              <span className={`kpi-badge ${c.badgeType}`}>{c.badge}</span>
            </div>
            <div className="kpi-value" style={{ marginBottom: 2 }}>{c.value}</div>
            <div className="kpi-label">{c.label}</div>
            <div style={{ marginTop: 8 }}>
              <MiniSparkline data={c.spark} color={c.sparkColor} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts: CPU | Temp | Power Distribution ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.82fr", gap: 18, marginBottom: 20 }}>

        {/* CPU chart */}
        <motion.div className="chart-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">📈 CPU Usage</div>
            <span className="chart-badge">Live</span>
          </div>
          <Line data={cpuData} options={mkOpts()} />
          <StatChips items={[
            { label: "Min",  value: `${minCpu}%`,  col: "#22c55e" },
            { label: "Avg",  value: `${avgCpu}%`,  col: "var(--slate-500)" },
            { label: "Max",  value: `${maxCpu}%`,  col: "#ef4444" },
          ]} />
        </motion.div>

        {/* Temperature chart */}
        <motion.div className="chart-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.4 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">🌡️ Temperature</div>
            <span className="chart-badge temp">{tSym}</span>
          </div>
          <Line data={tempData} options={mkOpts()} />
          <StatChips items={[
            { label: "Min",  value: `${formatTemp(minTemp)}${tSym}`, col: "#22c55e" },
            { label: "Avg",  value: `${formatTemp(avgTempSummary)}${tSym}`, col: "var(--slate-500)" },
            { label: "Max",  value: `${formatTemp(maxTemp)}${tSym}`, col: "#ef4444" },
          ]} />
        </motion.div>

        {/* Power Distribution */}
        <motion.div className="chart-card"
          style={{ display: "flex", flexDirection: "column" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.4 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">⚡ Power Distribution</div>
            <span className="chart-badge">Live</span>
          </div>
          <PowerDistributionCard totalKw={kpi.power} />
        </motion.div>
      </div>

      {/* ── Insight Cards (bottom) ── */}
      <div className="insight-cards">
        {[
          {
            cls: "energy", icon: "⚡", title: "Energy Savings",
            value: `${insights.energySaved} kWh`, sub: "vs. previous 24h",
            tag: "↑ 8.3% improvement", tagCls: "positive",
            progress: Math.min(100, (insights.energySaved / 20) * 100), progressCol: "#22c55e",
          },
          {
            cls: "co2", icon: "🌿", title: "CO₂ Emission Reduced",
            value: `${insights.co2Reduced} kg`,
            sub: `≈ ${Math.round(insights.co2Reduced / 0.06)} trees planted today`,
            tag: "Carbon offset", tagCls: "info",
            progress: Math.min(100, (insights.co2Reduced / 15) * 100), progressCol: "#3b82f6",
          },
          {
            cls: "uptime", icon: "🕐", title: "Average Uptime",
            value: `${insights.uptime}%`, sub: "Monthly system reliability",
            tag: "SLA compliant", tagCls: "warm",
            progress: insights.uptime, progressCol: "#f97316",
          },
        ].map((c, i) => (
          <motion.div
            key={c.cls}
            className={`insight-card ${c.cls}`}
            custom={i} variants={cardVariants}
            initial="hidden" animate="visible"
            whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
          >
            <div className="insight-header">
              <span className="insight-icon">{c.icon}</span>
              <span className="insight-title">{c.title}</span>
            </div>
            <div className="insight-value">{c.value}</div>
            <div className="insight-sub">{c.sub}</div>

            {/* Progress bar towards target */}
            <div style={{
              background: "var(--slate-100)", borderRadius: 8, height: 5,
              overflow: "hidden", margin: "10px 0 8px",
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 + i * 0.1 }}
                style={{ height: "100%", background: c.progressCol, borderRadius: 8 }}
              />
            </div>
            <span className={`insight-tag ${c.tagCls}`}>{c.tag}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}