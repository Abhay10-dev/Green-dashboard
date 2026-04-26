import React from "react";
import { motion } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

export default function PowerDistributionCard({ totalKw = 7.48 }) {
  // Compute dynamically to ensure UI responsiveness.
  const itkW = +(totalKw * 0.45).toFixed(2);
  const coolingkW = +(totalKw * 0.35).toFixed(2);
  const powerkW = +(totalKw * 0.12).toFixed(2);
  const otherskW = +(totalKw - itkW - coolingkW - powerkW).toFixed(2);

  const SEGMENTS = [
    { label: "IT Equipment",   pct: Math.round((itkW / totalKw) * 100), kw: itkW, color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
    { label: "Cooling System", pct: Math.round((coolingkW / totalKw) * 100), kw: coolingkW, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    { label: "Power Supply",   pct: Math.round((powerkW / totalKw) * 100), kw: powerkW, color: "#facc15", bg: "rgba(250,204,21,0.15)" },
    { label: "Others",         pct: Math.round((otherskW / totalKw) * 100), kw: otherskW, color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  ];
  /* ── Center-label plugin ── */
  const centerPlugin = {
    id: "centerLabel",
    beforeDraw(chart) {
      const { ctx, chartArea: { top, bottom, left, right } } = chart;
      const cx = (left + right) / 2;
      const cy = (top + bottom) / 2;

      ctx.save();

      /* value */
      ctx.font = "700 19px Inter, -apple-system, sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${totalKw} kW`, cx, cy - 10);

      /* sub-label */
      ctx.font = "400 11px Inter, -apple-system, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Total Power", cx, cy + 11);

      ctx.restore();
    },
  };

  const donutData = {
    labels: SEGMENTS.map(s => s.label),
    datasets: [{
      data: SEGMENTS.map(s => s.pct),
      backgroundColor: SEGMENTS.map(s => s.color),
      borderColor: "#ffffff",
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const donutOpts = {
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) => ` ${c.label}: ${SEGMENTS[c.dataIndex].kw} kW (${c.raw}%)`,
        },
      },
    },
    animation: { duration: 700, easing: "easeInOutQuart" },
  };

  /* efficiency colour band */
  const pue = +(totalKw / 5.62).toFixed(2);        // approx PUE from live power
  const efficiencyLabel = pue < 1.3 ? "Excellent" : pue < 1.5 ? "Good" : "Needs Attention";
  const efficiencyColor  = pue < 1.3 ? "#22c55e"  : pue < 1.5 ? "#f97316" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Doughnut ── */}
      <div style={{ width: 164, margin: "2px auto 22px" }}>
        <Doughnut data={donutData} options={donutOpts} plugins={[centerPlugin]} />
      </div>

      {/* ── Animated bar rows ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 13, flex: 1 }}>
        {SEGMENTS.map((seg, i) => (
          <motion.div
            key={seg.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.09, duration: 0.35, ease: "easeOut" }}
          >
            {/* label row */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 5,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: seg.color, flexShrink: 0, display: "inline-block",
                }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: "#475569" }}>
                  {seg.label}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{seg.kw} kW</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: seg.bg, color: seg.color,
                  padding: "2px 8px", borderRadius: 20,
                }}>
                  {seg.pct}%
                </span>
              </div>
            </div>

            {/* animated fill bar */}
            <div style={{
              background: "#f1f5f9", borderRadius: 10,
              height: 7, overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${seg.pct}%` }}
                transition={{ delay: 0.22 + i * 0.09, duration: 0.85, ease: "easeOut" }}
                style={{ height: "100%", background: seg.color, borderRadius: 10 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Footer: total + efficiency ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.35 }}
        style={{
          marginTop: 18,
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* total row */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "9px 14px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}>
          <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>
            Total Consumption
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
            {totalKw} kW
          </span>
        </div>

        {/* efficiency row */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "9px 14px",
          background: "#ffffff",
        }}>
          <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>
            Efficiency
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: efficiencyColor,
            background: `${efficiencyColor}18`,
            padding: "3px 10px", borderRadius: 20,
          }}>
            {efficiencyLabel}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
