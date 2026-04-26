import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaServer, FaThermometerHalf, FaMicrochip,
  FaNetworkWired, FaMemory, FaCircle,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { useSettings } from "../SettingsContext";

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randF = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

/* ── helpers ── */
function cpuClass(v) {
  if (v < 60) return "low";
  if (v < 80) return "mid";
  return "high";
}

function healthScore(cpu, temp, status, settings) {
  if (status === "Offline") return 0;
  let score = 100;
  if (cpu > settings.cpuLimit) score -= 25;
  else if (cpu > settings.cpuLimit - 20) score -= 10;
  if (temp > settings.tempLimit) score -= 25;
  else if (temp > settings.tempLimit - 5) score -= 8;
  if (status === "Warning") score -= 15;
  return Math.max(0, score);
}

function healthColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 55) return "#f97316";
  return "#ef4444";
}

function healthLabel(score) {
  if (score >= 80) return "Healthy";
  if (score >= 55) return "Degraded";
  return "Critical";
}

/* ── Tiny SVG Sparkline ── */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return <div style={{ height: 32 }} />;
  const w = 90, h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${h} ` + pts + ` ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polygon points={area} fill={`${color}20`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Health Ring ── */
function HealthRing({ score }) {
  const r = 18, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const col = healthColor(score);
  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <svg width={48} height={48} viewBox="0 0 48 48" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={24} cy={24} r={r} fill="none" stroke="#f1f5f9" strokeWidth={4} />
        <motion.circle
          cx={24} cy={24} r={r} fill="none"
          stroke={col} strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: col,
      }}>
        {score}
      </div>
    </div>
  );
}

/* ── Filters ── */
const FILTERS = ["All", "Online", "Warning", "Offline"];

/* ── Server Card ── */
function ServerCard({ server, index, settings }) {
  const score = healthScore(server.cpu, server.temp, server.status, settings);
  const col = healthColor(score);
  const cpuCls = cpuClass(server.cpu);
  const cpuBarColor = cpuCls === "low" ? "#22c55e" : cpuCls === "mid" ? "#f59e0b" : "#ef4444";
  const statusColors = { Online: "#22c55e", Warning: "#f97316", Offline: "#ef4444" };
  const statusBgs    = { Online: "var(--green-50)", Warning: "#fff7ed", Offline: "#fef2f2" };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      style={{
        background: "var(--bg-card)",
        borderRadius: 14,
        border: "1px solid var(--border-color)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        cursor: "default",
        transition: "box-shadow 0.25s",
        borderTop: `3px solid ${statusColors[server.status]}`,
      }}
    >
      {/* ── Top row: name + health ring ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FaServer style={{ color: "var(--slate-500)", fontSize: 13 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>{server.name}</span>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 11.5, fontWeight: 600,
            color: statusColors[server.status],
            background: statusBgs[server.status],
            padding: "2px 9px", borderRadius: 20, width: "fit-content",
          }}>
            <FaCircle style={{ fontSize: 6 }} />
            {server.status}
          </span>
        </div>
        <HealthRing score={score} />
      </div>

      {/* ── CPU bar ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11.5, color: "var(--slate-500)", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
            <FaMicrochip style={{ fontSize: 11 }} /> CPU
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: cpuBarColor }}>{server.cpu}%</span>
        </div>
        <div style={{ background: "var(--slate-100)", borderRadius: 10, height: 7, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${server.cpu}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ height: "100%", background: cpuBarColor, borderRadius: 10 }}
          />
        </div>
      </div>

      {/* ── Stats row: Temp · RAM · Network ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[
          {
            icon: <FaThermometerHalf />,
            label: "Temp",
            value: settings.tempUnit === "F" ? `${(server.temp * 9/5 + 32).toFixed(1)}°F` : `${server.temp}°C`,
            color: server.temp > settings.tempLimit ? "#ef4444" : "#22c55e",
          },
          {
            icon: <FaMemory />,
            label: "RAM",
            value: `${server.ram}%`,
            color: server.ram > 85 ? "#ef4444" : server.ram > 70 ? "#f97316" : "#3b82f6",
          },
          {
            icon: <FaNetworkWired />,
            label: "Net",
            value: `${server.net} MB/s`,
            color: "#a855f7",
          },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{
            background: "var(--slate-50)",
            borderRadius: 9,
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            border: "1px solid var(--border-color)",
          }}>
            <span style={{ fontSize: 10, color: "var(--slate-400)", display: "flex", alignItems: "center", gap: 4 }}>
              {icon} {label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── CPU Sparkline ── */}
      <div>
        <div style={{ 
          fontSize: 10.5, color: "var(--slate-400)", fontWeight: 500,
          marginBottom: 3, display: "flex", justifyContent: "space-between" 
        }}>
          <span>CPU Trend</span>
          <span style={{ color: col, fontWeight: 600 }}>{healthLabel(score)}</span>
        </div>
        <Sparkline data={server.history} color={cpuBarColor} />
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   Main Component
════════════════════════════════════════ */
export default function Servers() {
  const { settings } = useSettings();
  const [servers, setServers] = useState([]);
  const [lastUpdate, setLastUpdate] = useState("");
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing]   = useState(false);
  const historiesRef = useRef({});

  const generateServers = () => {
    const data = [];
    for (let i = 1; i <= 12; i++) {
      const name = `Server-${String(i).padStart(2, "0")}`;
      const cpu  = rand(15, 98);
      const temp = rand(20, 42);
      const ram  = rand(25, 95);
      const net  = randF(0.5, 180);

      let status = "Online";
      if (temp > settings.tempLimit || cpu > settings.cpuLimit || ram > 90) status = "Warning";
      if (cpu > 95) status = "Offline";

      /* maintain per-server CPU history (last 10 ticks) */
      if (!historiesRef.current[name]) historiesRef.current[name] = [];
      historiesRef.current[name] = [...historiesRef.current[name], cpu].slice(-10);

      data.push({ name, cpu, temp, ram, net, status, history: [...historiesRef.current[name]] });
    }
    setServers(data);
    setLastUpdate(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    generateServers();
    if (!settings.autoRefresh) return;
    const interval = setInterval(generateServers, settings.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval, settings.tempLimit, settings.cpuLimit]);

  const handleRefresh = () => {
    setRefreshing(true);
    generateServers();
    setTimeout(() => setRefreshing(false), 600);
  };

  const filtered = filter === "All" ? servers : servers.filter(s => s.status === filter);

  /* aggregate stats */
  const avgCpu  = servers.length ? Math.round(servers.reduce((a, s) => a + s.cpu,  0) / servers.length) : 0;
  const avgTemp = servers.length ? Math.round(servers.reduce((a, s) => a + s.temp, 0) / servers.length) : 0;
  const avgRam  = servers.length ? Math.round(servers.reduce((a, s) => a + s.ram,  0) / servers.length) : 0;

  const statusCounts = {
    Online:  servers.filter(s => s.status === "Online").length,
    Warning: servers.filter(s => s.status === "Warning").length,
    Offline: servers.filter(s => s.status === "Offline").length,
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <div className="page-title">
            <FaServer style={{ color: "var(--blue-500)" }} />
            Server Monitoring
          </div>
          <div className="page-subtitle">
            12 servers · Last updated {lastUpdate}
          </div>
        </div>

        {/* Refresh button */}
        <motion.button
          onClick={handleRefresh}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px",
            background: "var(--bg-card)", border: "1px solid var(--border-color)",
            borderRadius: 9, cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: "var(--slate-600)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <motion.span
            animate={{ rotate: refreshing ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex" }}
          >
            <MdRefresh style={{ fontSize: 17 }} />
          </motion.span>
          Refresh
        </motion.button>
      </motion.div>

      {/* ── Top KPI strip ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(6,1fr)",
        gap: 12, marginBottom: 22,
      }}>
        {[
          { label: "Total",   value: 12,              color: "var(--slate-500)", bg: "var(--slate-50)",        border: "var(--border-color)" },
          { label: "Online",  value: statusCounts.Online,  color: "#22c55e", bg: "var(--green-50)", border: "#bbf7d0" },
          { label: "Warning", value: statusCounts.Warning, color: "#f97316", bg: "#fff7ed",        border: "#fed7aa" },
          { label: "Offline", value: statusCounts.Offline, color: "#ef4444", bg: "#fef2f2",        border: "#fecaca" },
          { label: "Avg CPU", value: `${avgCpu}%`,    color: "#3b82f6", bg: "#eff6ff",        border: "#bfdbfe" },
          { label: "Avg RAM", value: `${avgRam}%`,    color: "#a855f7", bg: "#faf5ff",        border: "#e9d5ff" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            style={{
              background: s.bg, borderRadius: 10,
              border: `1px solid ${s.border}`,
              padding: "12px 14px",
              display: "flex", flexDirection: "column", gap: 2,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--slate-500)", fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 12.5, color: "var(--slate-500)", fontWeight: 600, marginRight: 4 }}>
          Filter:
        </span>
        {FILTERS.map(f => {
          const active = filter === f;
          const dotColors = { All: "#64748b", Online: "#22c55e", Warning: "#f97316", Offline: "#ef4444" };
          return (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: "6px 14px",
                border: active ? "1.5px solid #22c55e" : "1px solid var(--border-color)",
                borderRadius: 20,
                background: active ? "var(--green-50)" : "var(--bg-card)",
                color: active ? "var(--green-700)" : "var(--slate-500)",
                fontSize: 12.5, fontWeight: active ? 700 : 500,
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.18s",
              }}
            >
              {f !== "All" && (
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: dotColors[f], display: "inline-block",
                }} />
              )}
              {f}
              {f !== "All" && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: active ? "#dcfce7" : "#f1f5f9",
                  color: active ? "#15803d" : "#64748b",
                  padding: "1px 6px", borderRadius: 10,
                }}>
                  {statusCounts[f] ?? 0}
                </span>
              )}
            </motion.button>
          );
        })}

        <div style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>
          Showing {filtered.length} / 12 servers
        </div>
      </motion.div>

      {/* ── Server Card Grid ── */}
      <motion.div
        layout
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((server, i) => (
            <ServerCard key={server.name} server={server} index={i} settings={settings} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              textAlign: "center", padding: "60px 0",
              color: "#94a3b8", fontSize: 14,
            }}
          >
            No servers match the selected filter.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}