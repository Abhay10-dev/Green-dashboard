import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    tempLimit: 35,
    cpuLimit: 85,
    powerLimit: 12,
    autoRefresh: true,
    refreshInterval: 2,
    theme: "light",
    currency: "USD",
    tempUnit: "C",
    energyUnit: "kW",
    alertsEnabled: true,
    soundActive: false,
    alertSeverity: "all",
    username: "Admin",
    role: "Administrator",
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("green-dc-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        if (parsed.theme) {
          document.body.setAttribute("data-theme", parsed.theme);
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    } else {
      document.body.setAttribute("data-theme", settings.theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSetting = (key, val) => {
    setSettings((prev) => {
      const newSet = { ...prev, [key]: val };
      localStorage.setItem("green-dc-settings", JSON.stringify(newSet));
      if (key === "theme") {
        document.body.setAttribute("data-theme", val);
      }
      return newSet;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};
