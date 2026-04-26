import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationCircle, FaExclamationTriangle, FaCheckCircle, FaBell, FaShieldAlt } from "react-icons/fa";
import { useSettings } from "../SettingsContext";
import { useMetrics } from "../MetricsContext";

export default function Alerts() {
  const { settings } = useSettings();
  const { alerts, acknowledgeAlert } = useMetrics();
  
  const [filter, setFilter] = useState("all");

  const stats = {
    critical: alerts.filter(a => a.type === "critical" && a.status !== "resolved").length,
    warning: alerts.filter(a => a.type === "warning" && a.status !== "resolved").length,
    resolved: alerts.filter(a => a.status === "resolved").length,
  };

  const filteredAlerts = alerts.filter(a => filter === "all" || (filter === "resolved" ? a.status === "resolved" : (a.type === filter && a.status !== "resolved")));

  const getIcon = (type) => {
    switch(type) {
      case "critical": return <FaExclamationCircle color="#ef4444" />;
      case "warning": return <FaExclamationTriangle color="#f97316" />;
      case "resolved": return <FaCheckCircle color="#22c55e" />;
      default: return <FaBell />;
    }
  };

  const getPill = (type) => {
    switch(type) {
      case "critical": return <span style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Critical</span>;
      case "warning": return <span style={{ background: "#fff7ed", color: "#f97316", border: "1px solid #fed7aa", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Warning</span>;
      case "resolved": return <span style={{ background: "var(--green-50)", color: "var(--green-600)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Resolved</span>;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-title">
          <FaBell style={{ color: "#ef4444" }} /> Alerts & Notifications
        </div>
        <div className="page-subtitle">Real-time monitoring and incident history log according to threshold configurations.</div>
      </motion.div>

      {/* ── Summary Stats ── */}
      <div className="cards" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        {[
          { label: "Active Critical", value: stats.critical, icon: <FaShieldAlt />, color: "red" },
          { label: "Active Warnings", value: stats.warning,  icon: <FaExclamationTriangle />, color: "orange" },
          { label: "Resolved Incidents", value: stats.resolved, icon: <FaCheckCircle />, color: "green" },
          { label: "Total Monitored Nodes", value: 12,       icon: <FaShieldAlt />, color: "blue" },
        ].map((s, i) => (
          <motion.div 
            key={s.label} className="card kpi-card" 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          >
            <div className="kpi-top">
              <div className={`kpi-icon ${s.color}`}>{s.icon}</div>
            </div>
            <div className="kpi-value">{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["all", "critical", "warning", "resolved"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px", borderRadius: 20, cursor: "pointer",
              background: filter === f ? "var(--slate-800)" : "var(--bg-card)",
              color: filter === f ? "var(--bg-card)" : "var(--slate-500)",
              border: `1px solid ${filter === f ? "transparent" : "var(--border-color)"}`,
              fontWeight: 600, fontSize: 13, textTransform: "capitalize",
              transition: "all 0.2s"
            }}
          >
            {f} {f !== "all" && `(${stats[f]})`}
          </button>
        ))}
      </div>

      {/* ── Alerts Table ── */}
      <motion.div 
        className="server-table-wrap"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        <div className="table-header">
          <div className="table-title">Incident Log</div>
          <div className="table-refresh-hint">Live feed synced with context</div>
        </div>
        <table className="server-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Time</th>
              <th>Metric Area</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--slate-400)" }}>
                    No alerts found for this filter.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((a) => (
                  <motion.tr 
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {getIcon(a.status === "resolved" ? "resolved" : a.type)}
                        {getPill(a.status === "resolved" ? "resolved" : a.type)}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--slate-500)", whiteSpace: "nowrap" }}>
                      {a.time.toLocaleTimeString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.metric}</td>
                    <td>{a.msg}</td>
                    <td>
                      {a.status !== "resolved" && (
                        <button 
                          onClick={() => acknowledgeAlert(a.id)}
                          style={{
                            padding: "6px 12px", background: "var(--bg-main)",
                            border: "1px solid var(--border-color)", borderRadius: 6,
                            cursor: "pointer", fontSize: 12, color: "var(--slate-700)", fontWeight: 600
                          }}
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
