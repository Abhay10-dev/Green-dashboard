import React from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, CategoryScale, LinearScale,
  PointElement, Tooltip, Legend, Filler
} from "chart.js";
import { FaBolt, FaLeaf, FaDollarSign, FaIndustry, FaChartLine } from "react-icons/fa";
import PowerDistributionCard from "./PowerDistributionCard";
import { useSettings } from "../SettingsContext";
import { useMetrics } from "../MetricsContext";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

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

export default function Energy() {
  const { settings } = useSettings();
  const { metrics, timeSeries } = useMetrics();
  
  const data = {
    power: metrics.facility.totalPower,
    pue: metrics.derived.pue,
    energySaved: metrics.derived.energySaved,
    percentImproved: 8.5, // Static heuristic
  };

  const trend = {
    labels: timeSeries.labels,
    datasets: [{
      label: "Power Usage (kW)",
      data: timeSeries.power,
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      fill: true, tension: 0.4,
    }],
  };

  const getCurrencySymbol = () => {
    if (settings.currency === "EUR") return "€";
    if (settings.currency === "INR") return "₹";
    return "$"; // Default USD
  };
  
  const currSym = getCurrencySymbol();
  const costPerHour = (data.power * 0.12).toFixed(2); // $0.12 per kWh
  const pueStatus = data.pue < 1.3 ? "Good" : data.pue < 1.5 ? "Moderate" : "Poor";
  const pueCol = pueStatus === "Good" ? "#22c55e" : pueStatus === "Moderate" ? "#f59e0b" : "#ef4444";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-title">
          <FaBolt style={{ color: "var(--blue-500)" }} /> Energy Module
        </div>
        <div className="page-subtitle">Track power consumption, efficiency, and operational costs.</div>
      </motion.div>

      {/* ── KPI Strip ── */}
      <div className="cards" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        {[
          { label: "Total Power", value: `${data.power} kW`, icon: <FaIndustry />, col: "blue", stat: "Live Usage" },
          { label: "Efficiency (PUE)", value: data.pue, icon: <FaLeaf />, col: pueStatus === "Good" ? "green" : "orange", stat: pueStatus, statCol: pueCol },
          { label: "Est. Cost/Hour", value: `${currSym}${costPerHour}`, icon: <FaDollarSign />, col: "purple", stat: `Based on ${currSym}0.12/kWh` },
          { label: "Energy Savings", value: `${data.energySaved.toFixed(1)} kWh`, icon: <FaChartLine />, col: "green", stat: `↑ ${data.percentImproved.toFixed(1)}% vs yesterday`, statCol: "#22c55e" },
        ].map((c, i) => (
          <motion.div key={c.label} className="card kpi-card" custom={i} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}>
            <div className="kpi-top">
              <div className={`kpi-icon ${c.col}`}>{c.icon}</div>
              {c.statCol ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: c.statCol, background: `${c.statCol}20`, padding: "4px 8px", borderRadius: 12 }}>
                  {c.stat}
                </span>
              ) : (
                <span className="chart-badge">{c.stat}</span>
              )}
            </div>
            <div className="kpi-value" style={{ marginTop: 12, marginBottom: 4 }}>{c.value}</div>
            <div className="kpi-label">{c.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        {/* Trend Line */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ display: "flex", flexDirection: "column" }}>
          <div className="chart-card-header">
            <div className="chart-card-title">📉 Energy Usage Trend</div>
          </div>
          <div style={{ height: 260, marginTop: 10, flex: 1 }}>
            <Line data={trend} options={chartOpts} />
          </div>
        </motion.div>

        {/* Pie Distribution */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ display: "flex", flexDirection: "column" }}>
          <div className="chart-card-header">
            <div className="chart-card-title">🥧 Power Usage Distribution</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
             <PowerDistributionCard totalKw={data.power} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
