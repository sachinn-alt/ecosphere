# EcoSphere - Carbon Footprint Tracker & Reduction Platform

EcoSphere is a premium, interactive Single-Page Application (SPA) designed to help individuals calculate, analyze, simulate, and reduce their carbon footprint through simple actions and personalized insights.

## Features

1. **Precision Carbon Calculator**: Multi-step slider and selector form divided into Transport, Home Energy, Diet, and Lifestyle.
2. **Dynamic Visual Analytics**: Responsive Donut and Bar charts tracking footprint distribution and global averages.
3. **Commitments Planner**: Action list where selecting reductions offsets your "Future Forecast" footprint.
4. **Planetary Simulator**: Projections on how global adoption of your lifestyle affects temperatures and sea level.
5. **Gamification & Badges**: Unlockable status levels and achievements to promote sustainable living.

## Emissions Calculation Formula & Factors

Calculations are computed on an annual basis (expressed in **kg CO₂e / year**) using factors aligned with the **US EPA** and the **UK DEFRA (2024)**:

### 1. Transportation
* **Car**: Weekly mileage extrapolated to annual travel ($52 \times \text{KM/week}$).
  * *Petrol*: $0.22\text{ kg CO₂e / km}$
  * *Diesel*: $0.25\text{ kg CO₂e / km}$
  * *Hybrid*: $0.12\text{ kg CO₂e / km}$
  * *Electric*: $0.05\text{ kg CO₂e / km}$ (grid generation overhead)
* **Flights**: Total flight hours per year multiplied by average short-haul/long-haul emission factors ($150\text{ kg CO₂e / hour}$).
* **Transit**: Public rail/bus travel ($52 \times \text{KM/week}$) multiplied by $0.04\text{ kg CO₂e / km}$.

### 2. Home Energy
* **Electricity**: Monthly usage extrapolated to annual ($12 \times \text{kWh/month}$) multiplied by average grid emissions ($0.40\text{ kg CO₂e / kWh}$). Clean energy share offsets grid dependency:
  $$\text{Emissions} = \text{Usage} \times 0.40 \times \left(1 - \frac{\text{Clean Energy \%}}{100}\right)$$
* **Natural Gas**: Monthly consumption ($12 \times \text{m³/month}$) multiplied by heating factor ($2.0\text{ kg CO₂e / m³}$).
* **Heating Oil / LPG**: Monthly volume ($12 \times \text{Liters/month}$) multiplied by fuel oil factor ($2.5\text{ kg CO₂e / Liter}$).

### 3. Diet & Food
* **Diet Base**: Fixed baseline emissions per diet profile:
  * *Heavy Meat*: $2500\text{ kg/year}$
  * *Moderate Meat*: $1700\text{ kg/year}$
  * *Vegetarian*: $1200\text{ kg/year}$
  * *Vegan*: $900\text{ kg/year}$
* **Organic/Local Share**: Reduces food emissions by up to $10\%$:
  $$\text{Emissions} = \text{Base} \times \left(1 - \frac{\text{Organic \%}}{100} \times 0.10\right)$$

### 4. Lifestyle & Shopping
* **Clothing**: Number of items purchased per year multiplied by average manufacturing impact ($25\text{ kg CO₂e / item}$).
* **Electronics**: Number of device upgrades (phones, PCs) per year multiplied by manufacturing/mining average ($150\text{ kg CO₂e / device}$).
* **Baseline Services**: A flat $400\text{ kg CO₂e / year}$ is added to cover municipal services, water usage, and general waste.
* **Recycling rate**: Offsets total lifestyle emissions by up to $25\%$:
  $$\text{Emissions} = \text{Lifestyle Base} \times \left(1 - \frac{\text{Recycling \%}}{100} \times 0.25\right)$$

---

## Technical Stack & Libraries

* **Core Structure**: Semantic HTML5 with an intuitive sidebar container layout.
* **Styling System**: Vanilla CSS featuring variables, dark-mode styling, backdrop blur glassmorphic cards, custom range sliders, glowing achievements, and responsive media queries.
* **Visualization Layer**: [Chart.js (v4)](https://www.chartjs.org/) via CDN, styled to match the dark neon green/slate palette.
* **Icons**: [FontAwesome (v6)](https://fontawesome.com) CDN.

## Local Launch Instructions

To launch the project, simply open `index.html` directly in any web browser, or serve it using a local developer web server:

```bash
# Using Python
python -m http.server 8000

# Using Node (if npx/http-server is available)
npx http-server
```
Navigate to `http://localhost:8000` to view the application.
