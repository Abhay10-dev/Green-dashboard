import React from "react";
import { motion } from "framer-motion";
import { FaInfoCircle, FaSeedling, FaCode, FaServer, FaShieldAlt } from "react-icons/fa";

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const features = [
    {
      icon: <FaSeedling />,
      title: "Sustainability Focus",
      desc: "Designed to help IT infrastructure reduce carbon footprint through continuous tracking of PUE (Power Usage Effectiveness) and cooling optimization.",
      color: "#22c55e", bg: "var(--green-50)"
    },
    {
      icon: <FaCode />,
      title: "Modern Tech Stack",
      desc: "Built with React.js, Framer Motion for 60fps fluid animations, and Chart.js for real-time, interactive data visualization.",
      color: "#3b82f6", bg: "#eff6ff"
    },
    {
      icon: <FaServer />,
      title: "Real-time Monitoring",
      desc: "Live simulated data engine streaming CPU load, heat generation, and power draw across all nodes with instant alerts for anomalies.",
      color: "#f97316", bg: "#fff7ed"
    },
    {
      icon: <FaShieldAlt />,
      title: "Efficiency First",
      desc: "Provides actionable insight cards and tracking metrics to ensure servers comply with strict SLA standards and energy compliance.",
      color: "#a855f7", bg: "#faf5ff"
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ── */}
      <motion.div className="page-header" variants={itemVariants}>
        <div className="page-title">
          <FaInfoCircle style={{ color: "var(--blue-500)" }} />
          About Green DC
        </div>
        <div className="page-subtitle">Project mission · Architecture · Technology</div>
      </motion.div>

      <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* ── Main Banner ── */}
        <motion.div
          variants={itemVariants}
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: 16, padding: "34px", color: "white",
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.25)",
            display: "flex", flexDirection: "column", gap: 14,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            Pioneering the Future of Green Data Centers
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>
            The Green Data Center Monitoring Dashboard is a conceptual tool designed to tackle one of the IT industry's biggest challenges: environmental impact. By visualizing server health alongside power consumption and carbon offset metrics, it bridges the gap between infrastructure management and ecological responsibility.
          </div>
        </motion.div>

        {/* ── Grid Features ── */}
        <motion.div
          variants={itemVariants}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              whileHover={{ scale: 1.02, y: -4 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)", borderRadius: 14,
                padding: 22,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex", flexDirection: "column", gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: f.bg, color: f.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>
                  {f.title}
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--slate-500)", lineHeight: 1.55 }}>
                {f.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Version Info Footer ── */}
        <motion.div
          variants={itemVariants}
          style={{
            background: "var(--slate-50)", border: "1px solid var(--border-color)",
            borderRadius: 14, padding: 22,
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "var(--slate-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              System Information
            </div>
            <div style={{ fontSize: 14, color: "var(--slate-600)", fontWeight: 500 }}>
              v2.1.0-beta · Built for demonstration purposes
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "var(--brand-600)",
            background: "var(--brand-50)", padding: "4px 12px", borderRadius: 20
          }}>
            License: MIT
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
