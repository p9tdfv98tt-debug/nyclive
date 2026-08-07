# 🗽 NYC Live — Real-Time New York City Dashboard

A high-performance, real-time live dashboard for New York City residents, commuters, and tourists. NYC Live aggregates live city cameras, MTA subway statuses, real-time weather forecasts, alternate side parking alerts, news headlines, and quick municipal services into a unified, accessible interface.



---

## ✨ Features

- 📹 **Live NYC Webcams**: Stream high-definition live feeds from Times Square, Central Park, Midtown, Brooklyn, and iconic landmarks. Filterable by borough and neighborhood.
- 🚇 **MTA Subway Status**: Real-time service status, delays, and line advisories across the entire MTA subway network.
- ⛅ **Real-Time Weather & Forecasts**: Hourly and 7-day NYC weather forecasts, wind speeds, humidity, and National Weather Service alerts.
- 🅿️ **Alternate Side Parking (ASP)**: Daily NYC parking rule updates and holiday suspension schedules.
- 📰 **City News Ticker**: Aggregated live headlines covering breaking NYC news, transit updates, and civic announcements.
- ⚡ **Quick Municipal Actions**: One-tap access to 311 service requests, 511 traffic alerts, MTA trip planning, and 911 emergencies.
- 🌐 **Multilingual Support**: Built-in internationalization for English, Spanish (`es`), French (`fr`), Portuguese (`pt-BR`), and Polish (`pl`).

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (Custom CSS variable design system, CSS Grid/Flexbox).
- **Backend / Deployment**: Cloudflare Pages & Cloudflare Workers Functions (`/functions/api`).
- **Data Feeds**: OpenMeteo API, MTA Real-Time Data Feeds, NYC Open Data, NWS Alerts.

---

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/skylux6-cell/nyclive.git
   cd nyclive
   ```

2. **Run locally using Python static server**:
   ```bash
   python3 -m http.server 8080
   ```
   Open `http://localhost:8080` in your web browser.

3. **Run with Cloudflare Wrangler (full API functions support)**:
   ```bash
   npx wrangler pages dev .
   ```

---

## 🎨 Design System

NYC Live utilizes the **Civic Park Design System**, combining the authoritative structure of official municipal portals (`nyc.gov`) with the warm, organic aesthetic of Central Park:
- Primary Color: **NYC Blue** (`#0039A6`)
- Secondary Color: **Park Green** (`#1A472A`)
- Surface Base: Warm Neutral (`#F7F7F5`) / Pure White (`#FFFFFF`)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
