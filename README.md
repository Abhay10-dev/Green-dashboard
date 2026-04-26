# 🌱 Green Data Center Monitoring Dashboard

A sophisticated, enterprise-grade React application for real-time monitoring and analytics of sustainable data center operations. Built with a focus on comprehensive system tracking, thermal mapping, energy distribution, and alert management.

## ✨ Features

- **Global Centralized Engine:** A unified architecture (`MetricsContext`) providing synchronized state spanning servers, cooling arrays, overall energy load, and analytics. All nodes tick in unison.
- **Dynamic Analytics & Thermal Routing:** Real-time generation of moving CPU averages, Server Status clusters, interactive heatmaps, line charts, and Power Distribution graphs via `Chart.js`.
- **Systematic Rules Engine:** Global threshold observing (via integrated `SettingsContext`) ensures real-time Alerts trigger when critical hardware temperature, CPU percentage, or Network bounds are breached.
- **Intelligent Resource Module:** Highly responsive views capturing:
  - 🖥️ Server Overview (Individually mapped Nodes and Specs).
  - ⚡ Energy Module (Power usage metrics, PUE efficiency scores, and Carbon Offset insights).
  - ❄️ Cooling Systems (Thermal tracking mapping heat load versus cooling efficiency).
- **Responsive Dark/Light Mode:** First-class premium aesthetic incorporating dynamic CSS variable propagation, semantic shading, and robust fluid layouts explicitly handling high-density tables and graphs.
- **Global Settings Configuration:** Fully user-customizable metric parameters, thermal boundaries, UI themes, notification sounds, and dynamic display format switching (Celsius/Fahrenheit and kW/MW parameters globally sync!).

## 🚀 Technologies

- **React 18** (Hooks, Context Provider Architecture)
- **Framer Motion** (Fluid UI animations, card transitions, and micro-interactions)
- **Chart.js & React-Chartjs-2** (Data Visualization)
- **React-Icons** (Rich typography mapping)
- **CSS Variables** (Dynamic semantic variables supporting premium theming)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   ```

2. **Navigate into the project directory:**
   ```bash
   cd green-dashboard
   ```

3. **Install the dependencies:**
   ```bash
   npm install
   ```

4. **Start the local development server:**
   ```bash
   npm start
   ```

The application will begin running at [http://localhost:3000](http://localhost:3000).

## 🛠️ Project Architecture

```
src/
├── components/          
│   ├── Sidebar.js            # Main navigation router
│   ├── Dashboard.js          # High-level system overview
│   ├── Server.js             # Granular server and node tracking
│   ├── Analytics.js          # In-depth trend visualization
│   ├── Energy.js             # PUE, Carbon, and live power grids
│   ├── Cooling.js            # HVAC and Thermal heat maps
│   ├── Alerts.js             # Real-time incident logs
│   ├── Settings.js           # Interactive layout and system thresholds
│   └── PowerDistributionCard.js # Dynamic Doughnut power array
├── MetricsContext.js         # 🔑 Global Single Source of Truth Engine
├── SettingsContext.js        # Global Config and threshold bounds 
├── App.css                   # Master Semantic Theme Engine
└── App.js                    # Core Shell
```

## 📈 Future Optimizations

- Re-wiring the global architecture from a local `Math.random` interval heuristic to an explicit API interface or WebSocket payload stream for real IoT functionality. 
- Connecting the "Export Reports (CSV)" Setting button to a PDF/CSV blob generation endpoint.
- Integrating backend Auth.

---
*Built to empower sustainable, energy-efficient operational management.*
