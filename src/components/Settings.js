import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCog, FaBell, FaPalette, FaUser, FaSlidersH, 
  FaSave, FaTrash, FaFileExport, FaCheck
} from "react-icons/fa";
import { useSettings } from "../SettingsContext";

// ── Custom Toggle Switch ──
function Toggle({ isOn, onToggle }) {
  return (
    <div 
      onClick={onToggle}
      style={{
        width: 46, height: 26, borderRadius: 30,
        background: isOn ? "var(--green-500)" : "#cbd5e1",
        display: "flex", alignItems: "center",
        padding: "0 3px", cursor: "pointer", transition: "background 0.3s"
      }}
    >
      <motion.div
        layout
        initial={false}
        animate={{ x: isOn ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: 20, height: 20, borderRadius: "50%",
          background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
        }}
      />
    </div>
  );
}

// ── Layout Components ──
const FormGroup = ({ label, desc, children }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 0", borderBottom: "1px solid var(--border-color)"
  }}>
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>{label}</div>
      {desc && <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{desc}</div>}
    </div>
    <div style={{ flexShrink: 0, marginLeft: 20 }}>
      {children}
    </div>
  </div>
);

const Input = (props) => (
  <input {...props} style={{
    padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)",
    fontSize: 14, outline: "none", width: 120, fontFamily: "inherit", background: "var(--bg-main)", color: "var(--text-main)"
  }} />
);

const Select = ({ options, value, onChange }) => (
  <select value={value} onChange={onChange} style={{
    padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)",
    fontSize: 14, outline: "none", cursor: "pointer", fontFamily: "inherit", background: "var(--bg-main)", color: "var(--text-main)"
  }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export default function Settings() {
  const [activeTab, setActiveTab] = useState("system");
  const [savedMsg, setSavedMsg] = useState(false);

  const { settings: cfg, updateSetting: update } = useSettings();

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const tabs = [
    { id: "system", label: "System Limits", icon: <FaSlidersH /> },
    { id: "display", label: "Display & Units", icon: <FaPalette /> },
    { id: "notif", label: "Notifications", icon: <FaBell /> },
    { id: "user", label: "User Profile", icon: <FaUser /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      
      {/* Header */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <div className="page-title">
              <FaCog style={{ color: "var(--green-500)" }} /> Configuration & Settings
            </div>
            <div className="page-subtitle">Manage system thresholds, alerts, and formatting preferences.</div>
          </div>
          
          {/* Global Save Button */}
          <motion.button 
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            style={{
              background: savedMsg ? "#22c55e" : "var(--green-500)", color: "#fff",
              border: "none", padding: "10px 20px", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "background 0.3s"
            }}
          >
            {savedMsg ? <FaCheck /> : <FaSave />}
            {savedMsg ? "Saved Successfully" : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Settings Body */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        
        {/* Left Sidebar (Categories) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ 
            width: 240, background: "var(--bg-card)", borderRadius: 16, padding: 16, 
            boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", flexShrink: 0 
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12, paddingLeft: 12 }}>
            Categories
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 10,
                  fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeTab === t.id ? "var(--green-50)" : "transparent",
                  color: activeTab === t.id ? "var(--green-600)" : "#64748b",
                }}
              >
                <span style={{ fontSize: 16, opacity: activeTab === t.id ? 1 : 0.6 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right Content Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ 
            flex: 1, background: "var(--bg-card)", borderRadius: 16, padding: "30px 40px",
            boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", minHeight: 450
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* SYSTEM LIMITS TAB */}
              {activeTab === "system" && (
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 24, color: "var(--text-main)" }}>System Limits & Thresholds</h2>
                  
                  <FormGroup label="Max Temperature Threshold" desc="Triggers alerts when average or server temp crosses this limit.">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Input type="number" value={cfg.tempLimit} onChange={e => update("tempLimit", e.target.value)} />
                      <span style={{ color: "#64748b", fontSize: 14 }}>°C</span>
                    </div>
                  </FormGroup>
                  
                  <FormGroup label="CPU Usage Limit" desc="Warning threshold for computational load across nodes.">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Input type="number" value={cfg.cpuLimit} onChange={e => update("cpuLimit", e.target.value)} />
                      <span style={{ color: "#64748b", fontSize: 14 }}>%</span>
                    </div>
                  </FormGroup>

                  <FormGroup label="Power Limit (Max Load)" desc="Maximum facility kW allocation before critical overload.">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Input type="number" value={cfg.powerLimit} onChange={e => update("powerLimit", e.target.value)} />
                      <span style={{ color: "#64748b", fontSize: 14 }}>kW</span>
                    </div>
                  </FormGroup>

                  <h3 style={{ fontSize: 15, marginTop: 32, marginBottom: 12, color: "#475569" }}>Data Polling</h3>
                  
                  <FormGroup label="Auto-Refresh Data" desc="Continuously poll sensors for live metric updates.">
                    <Toggle isOn={cfg.autoRefresh} onToggle={() => update("autoRefresh", !cfg.autoRefresh)} />
                  </FormGroup>

                  <FormGroup label="Refresh Interval" desc="Time between each data update cycle.">
                    <Select 
                      options={[{ label: "1 Second", value: 1 }, { label: "2 Seconds", value: 2 }, { label: "5 Seconds", value: 5 }]}
                      value={cfg.refreshInterval} onChange={e => update("refreshInterval", parseInt(e.target.value))}
                    />
                  </FormGroup>
                </div>
              )}

              {/* DISPLAY TAB */}
              {activeTab === "display" && (
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 24, color: "var(--text-main)" }}>Display & Units</h2>
                  
                  <FormGroup label="UI Theme" desc="Switch between light and dark mode appearances.">
                    <Select 
                      options={[{ label: "Light Mode ☀️", value: "light" }, { label: "Dark Mode 🌙", value: "dark" }]}
                      value={cfg.theme} onChange={e => update("theme", e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup label="Currency" desc="Used for cost estimation in the Energy module.">
                    <Select 
                      options={[{ label: "USD ($)", value: "USD" }, { label: "EUR (€)", value: "EUR" }, { label: "INR (₹)", value: "INR" }]}
                      value={cfg.currency} onChange={e => update("currency", e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup label="Temperature Unit" desc="Display thermal metrics in Celsius or Fahrenheit.">
                    <Select 
                      options={[{ label: "Celsius (°C)", value: "C" }, { label: "Fahrenheit (°F)", value: "F" }]}
                      value={cfg.tempUnit} onChange={e => update("tempUnit", e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup label="Energy Measurement" desc="Standard unit for power tracking cards.">
                    <Select 
                      options={[{ label: "Kilowatts (kW)", value: "kW" }, { label: "Megawatts (MW)", value: "MW" }]}
                      value={cfg.energyUnit} onChange={e => update("energyUnit", e.target.value)}
                    />
                  </FormGroup>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notif" && (
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 24, color: "var(--text-main)" }}>Notifications & Alerts</h2>

                  <FormGroup label="Enable System Alerts" desc="Visual red banners will appear for critical events.">
                    <Toggle isOn={cfg.alertsEnabled} onToggle={() => update("alertsEnabled", !cfg.alertsEnabled)} />
                  </FormGroup>

                  <FormGroup label="Sound Notifications" desc="Play a chime when an alert is triggered.">
                    <Toggle isOn={cfg.soundActive} onToggle={() => update("soundActive", !cfg.soundActive)} />
                  </FormGroup>

                  <FormGroup label="Alert Severity Level" desc="Choose which types of alerts to receive.">
                    <Select 
                      options={[
                        { label: "All Alerts (Info, Warn, Critical)", value: "all" }, 
                        { label: "Warnings & Critical Only", value: "warn" },
                        { label: "Critical Only", value: "critical" }
                      ]}
                      value={cfg.alertSeverity} onChange={e => update("alertSeverity", e.target.value)}
                    />
                  </FormGroup>
                </div>
              )}

              {/* USER TAB */}
              {activeTab === "user" && (
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 24, color: "var(--text-main)" }}>User & Data Management</h2>

                  <FormGroup label="Username" desc="Your display name in the dashboard.">
                    <Input type="text" value={cfg.username} onChange={e => update("username", e.target.value)} style={{ width: 200 }} />
                  </FormGroup>

                  <FormGroup label="Account Role" desc="Permissions assigned to your account.">
                    <div style={{ fontWeight: 600, color: "var(--green-600)", background: "var(--green-50)", padding: "6px 12px", borderRadius: 6, display: "inline-block" }}>
                      {cfg.role}
                    </div>
                  </FormGroup>

                  <h3 style={{ fontSize: 15, marginTop: 32, marginBottom: 12, color: "#475569" }}>Data Operations</h3>
                  
                  <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
                    <button style={{
                      padding: "10px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: "#475569"
                    }}>
                      <FaFileExport /> Export Reports (CSV)
                    </button>
                    <button style={{
                      padding: "10px 16px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: "#dc2626"
                    }}>
                      <FaTrash /> Reset All Data
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

    </motion.div>
  );
}
