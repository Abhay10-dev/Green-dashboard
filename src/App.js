import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Servers from "./components/Server";
import Analytics from "./components/Analytics";
import Energy from "./components/Energy";
import Cooling from "./components/Cooling";
import Settings from "./components/Settings";
import About from "./components/About";
import Alerts from "./components/Alerts";
import { SettingsProvider } from "./SettingsContext";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <SettingsProvider>
      <div className="app">
        <Sidebar setPage={setPage} activePage={page} />

        <div className="main">
          {page === "dashboard" && <Dashboard />}
          {page === "servers"   && <Servers />}
          {page === "energy"    && <Energy />}
          {page === "cooling"   && <Cooling />}
          {page === "alerts"    && <Alerts />}
          {page === "settings"  && <Settings />}
          {page === "analytics" && <Analytics />}
          {page === "about"     && <About />}
        </div>
      </div>
    </SettingsProvider>
  );
}