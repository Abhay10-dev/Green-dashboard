import React, { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "./SettingsContext";

const MetricsContext = createContext();

export const useMetrics = () => useContext(MetricsContext);

const NUM_SERVERS = 12;
const MAX_HISTORY = 12;

export const MetricsProvider = ({ children }) => {
  const { settings } = useSettings();

  const [metrics, setMetrics] = useState({
    servers: Array.from({ length: NUM_SERVERS }).map((_, i) => ({
      id: i,
      name: `Node-${i + 1}`,
      cpu: 40 + Math.random() * 20,
      temp: 22 + Math.random() * 10,
      power: 0.5,
      ram: 40 + Math.random() * 30,
      net: 10 + Math.random() * 50,
      status: "Online",
      history: [],
    })),
    facility: {
      totalPower: 8.0,
      itPower: 6.0,
      coolingPower: 1.5,
    },
    derived: {
      pue: 1.25,
      greenScore: 90,
      energySaved: 124.5,
      uptime: 99.9,
    },
  });

  const [alerts, setAlerts] = useState([]);
  const [cooldowns] = useState({});
  
  const [timeSeries, setTimeSeries] = useState({
    labels: Array(MAX_HISTORY).fill(""),
    cpu: Array(MAX_HISTORY).fill(50),
    temp: Array(MAX_HISTORY).fill(25),
    power: Array(MAX_HISTORY).fill(8.0),
    pue: Array(MAX_HISTORY).fill(1.2),
  });

  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  };

  useEffect(() => {
    if (!settings.autoRefresh) return;
    
    const tick = setInterval(() => {
      setMetrics(prev => {
        let currentItPower = 0;
        let totalCpu = 0;
        let totalTemp = 0;

        const updatedServers = prev.servers.map((s) => {
          let newCpu = s.cpu + (Math.random() * 14 - 7);
          newCpu = Math.max(5, Math.min(100, newCpu));
          
          let newTemp = s.temp + (Math.random() * 3 - 1.5);
          if (newCpu > 80) newTemp += 0.8;
          if (newCpu < 40) newTemp -= 0.5;
          newTemp = Math.max(18, Math.min(50, newTemp));

          let newPower = 0.3 + (newCpu / 100) * 0.6; // per node

          let newRam = s.ram + (Math.random() * 5 - 2.5);
          newRam = Math.max(20, Math.min(98, newRam));

          let newNet = s.net + (Math.random() * 20 - 10);
          newNet = Math.max(0, Math.min(200, newNet));

          let status = "Online";
          if (newTemp > settings.tempLimit || newCpu > settings.cpuLimit || newRam > 90) status = "Warning";
          if (newCpu > 95 || newTemp > settings.tempLimit + 5) status = "Offline";

          totalCpu += newCpu;
          totalTemp += newTemp;
          currentItPower += newPower;

          return { 
            ...s, 
            cpu: +newCpu.toFixed(1), 
            temp: +newTemp.toFixed(1), 
            power: +newPower.toFixed(2),
            ram: +newRam.toFixed(1),
            net: +newNet.toFixed(1),
            status,
            history: [...(s.history || []), +newCpu.toFixed(1)].slice(-10)
          };
        });

        const avgCpu = totalCpu / NUM_SERVERS;
        const avgTemp = totalTemp / NUM_SERVERS;

        const coolingPower = (avgTemp - 20) * 0.15 + (Math.random() * 0.5);
        const overhead = 0.5;
        const totalPower = currentItPower + coolingPower + overhead;
        const pue = totalPower / currentItPower;

        const greenScore = Math.max(0, Math.round(100 - (pue - 1) * 60 - (avgTemp > settings.tempLimit ? 15 : 0)));

        setTimeSeries(ts => {
          const l = [...ts.labels, new Date().toLocaleTimeString()].slice(-MAX_HISTORY);
          return {
            labels: l,
            cpu: [...ts.cpu, +avgCpu.toFixed(1)].slice(-MAX_HISTORY),
            temp: [...ts.temp, +avgTemp.toFixed(1)].slice(-MAX_HISTORY),
            power: [...ts.power, +totalPower.toFixed(2)].slice(-MAX_HISTORY),
            pue: [...ts.pue, +pue.toFixed(2)].slice(-MAX_HISTORY),
          };
        });

        if (settings.alertsEnabled) {
          let newAlerts = [];
          const now = Date.now();

          updatedServers.forEach(s => {
            if (s.temp > settings.tempLimit) {
              const k = `temp-${s.id}`;
              if (!cooldowns[k] || now - cooldowns[k] > 20000) {
                newAlerts.push({ id: `temp-${now}-${s.id}`, type: "critical", metric: "Temperature", msg: `${s.name} critical temp: ${s.temp.toFixed(1)}°C`, time: new Date(), status: 'active' });
                cooldowns[k] = now;
              }
            }
            if (s.cpu > settings.cpuLimit) {
              const k = `cpu-${s.id}`;
              if (!cooldowns[k] || now - cooldowns[k] > 20000) {
                newAlerts.push({ id: `cpu-${now}-${s.id}`, type: "warning", metric: "CPU", msg: `${s.name} CPU spiked to ${s.cpu.toFixed(1)}%`, time: new Date(), status: 'active' });
                cooldowns[k] = now;
              }
            }
          });

          if (totalPower > settings.powerLimit) {
            const k = `pwr`;
            if (!cooldowns[k] || now - cooldowns[k] > 30000) {
              newAlerts.push({ id: `pwr-${now}`, type: "warning", metric: "Power", msg: `Total power threshold exceeded: ${totalPower.toFixed(1)}kW`, time: new Date(), status: 'active' });
              cooldowns[k] = now;
            }
          }

          if (newAlerts.length > 0) {
            setAlerts(curr => [...newAlerts, ...curr].slice(0, 100));
          }
        }

        return {
          servers: updatedServers,
          facility: { totalPower: +totalPower.toFixed(2), itPower: +currentItPower.toFixed(2), coolingPower: +coolingPower.toFixed(2) },
          derived: { pue: +pue.toFixed(2), greenScore, energySaved: prev.derived.energySaved + (pue < 1.3 ? 0.05 : 0), uptime: 99.9 }
        };
      });
    }, settings.refreshInterval * 1000);

    return () => clearInterval(tick);
  }, [settings, cooldowns]);

  return (
    <MetricsContext.Provider value={{ metrics, timeSeries, alerts, acknowledgeAlert }}>
      {children}
    </MetricsContext.Provider>
  );
};
