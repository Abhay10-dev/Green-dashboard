import React from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaServer, FaHome, FaLeaf, FaInfoCircle, FaBolt, FaSnowflake, FaCog, FaBell } from "react-icons/fa";

const navItems = [
  { id: "dashboard", label: "Dashboard",  Icon: FaHome },
  { id: "servers",   label: "Servers",    Icon: FaServer },
  { id: "energy",    label: "Energy",     Icon: FaBolt },
  { id: "cooling",   label: "Cooling",    Icon: FaSnowflake },
  { id: "alerts",    label: "Alerts",     Icon: FaBell },
  { id: "settings",  label: "Settings",   Icon: FaCog },
  { id: "analytics", label: "Analytics",  Icon: FaChartLine },
  { id: "about",     label: "About",      Icon: FaInfoCircle },
];

export default function Sidebar({ setPage, activePage }) {
  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <FaLeaf />
        </div>
        <div>
          <div className="sidebar-logo-text">Green DC</div>
          <div className="sidebar-logo-sub">Data Center Monitor</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-label">Navigation</div>
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, Icon }, i) => (
          <motion.button
            key={id}
            className={`sidebar-btn ${activePage === id ? "active" : ""}`}
            onClick={() => setPage(id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="btn-icon"><Icon /></span>
            {label}

            {/* animated active indicator */}
            {activePage === id && (
              <motion.span
                layoutId="sidebar-indicator"
                style={{
                  position: "absolute",
                  right: 10,
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: "var(--green-500)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="live-dot" />
        Live data · 2s refresh
      </div>
    </motion.aside>
  );
}