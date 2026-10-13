# HealthGuard — Complete Hackathon Frontend

HealthGuard is a responsive healthcare SaaS dashboard and patient monitoring frontend designed for demonstration at college hackathons. It illustrates clinical telemetry visualization, transparent rule-based triage, synchronized doctor review queues, what-if lifestyle simulation, and data-integrity monitoring—built entirely client-side with zero external model dependencies.

---

## ⚠️ Important Educational Disclaimers

1. **Synthetic Data**: All patient names, demographics, vital-sign readings, and medical histories are fictional and simulated for educational presentation.
2. **Deterministic Rules, Not AI**: Triage priorities and alerts are derived from transparent algebraic rules and threshold boundaries (e.g. `SpO2 < 93%` or `Systolic BP >= 155 mmHg`), not a black-box AI model or machine learning classifier.
3. **What-If Simulator Limitations**: The What-If Simulator implements a simple, deterministic algebraic scenario heuristic with fixed multipliers. It does not predict physiological outcomes or disease risk. Prominently marked with:
   > *“Illustrative simulation — not a medical prediction.”*
4. **Hackathon Demo Only**: This application is a frontend demonstration prototype, **not a clinical product**, and must not be used for medical diagnosis, clinical decision support, or real-time patient care.

---

## 🛠️ Actual Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Build**: Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom typography and clean light/dark theme support
- **Icons**: Lucide React (`lucide-react`)
- **Visuals & Charts**: Custom, responsive SVG line charts with tooltips, threshold bands, and explicit missing-value gap handling
- **Persistence**: HTML5 `localStorage` for patient review statuses, doctor observation notes, and theme preference
- **Dependencies**: Zero backend, zero external paid APIs, zero external databases, zero external telemetry sensors.

---

## 🌟 Key Features & Page Navigation

1. **Dashboard (`Overview`)**:
   - Census KPIs: Total patients, reviews awaiting action, triage breakdown (High / Medium / Routine).
   - Telemetry Focus Chart: Interactive SVG time-series chart with metric toggles.
   - Live Review Queue shortcut and automated rule alert cards.
   - Real computed data freshness and missing packet counters.

2. **Patient Management (`Patient Directory`)**:
   - Filterable, searchable patient roster with sorting by name, admission date, priority, and review status.
   - Dynamic stay duration calculated continuously from stored admission dates (e.g. `4d 3h`).
   - Detailed patient dossier modal with transparent priority derivation explanations.

3. **Health Monitoring (`Telemetry Streams`)**:
   - Interactive SVG multi-metric chart (Heart Rate, Blood Pressure, SpO2, Blood Glucose, Temperature).
   - Explicit handling of missing data: packet dropouts are rendered as dashed visual breaks rather than coerced to zero.
   - Historical reading ledger with units (`bpm`, `mmHg`, `%`, `mg/dL`, `°F`).
   - Patient-specific rule alert ledger.

4. **Patient History (`Audit Timeline`)**:
   - Unified chronological timeline combining admission events, telemetry packet recordings, doctor reviews, and rule alerts.
   - Filtering by event category and instant text search.

5. **Doctor Review (`Physician Queue`)**:
   - Dedicated workflow for attending clinicians to inspect flagged patients.
   - Review disposition controls (`Pending Review`, `Follow-up Required`, `Reviewed`).
   - Free-form clinical observation notes with instant local persistence.
   - Synchronized review audit log updated across all views.

6. **What-If Simulator (`Scenario Sandbox`)**:
   - Lifestyle parameter adjustments: Sleep Duration (hrs), Physical Activity (mins), Meal Regularity (1-5).
   - Side-by-side comparison of baseline vitals with computed scenario shifts.
   - Transparent formula documentation and delta indicators.
   - Non-destructive guarantee: running simulations does not alter baseline patient records.

7. **Data & Model Status (`Integrity Console`)**:
   - Truthful statistics calculated from loaded application data: Total records, Available vs Missing packets, Out-of-bounds readings, and Stale sample counts (>12h threshold).
   - Model status display: **“No trained prediction model connected.”**
   - Documentation of active data-quality validation rules.

8. **Demo Mode Control Panel**:
   - Three deterministic, reproducible scenarios:
     - **Scenario A (Normal Readings)**: Stable recovery telemetry stream.
     - **Scenario B (Missing/Stale Telemetry)**: Sensor packet gaps and >12h timestamps demonstrating data-quality alarms.
     - **Scenario C (Unusual Reading Requiring Review)**: Acute tachycardia excursion (124 bpm) triggering demo rule `HR-TACHY` and routing to Doctor Review.
   - Controls: Play stream, Step forward, Pause, Rewind, and Return to default dataset.
   - Persistent banner: *“DEMO MODE — All readings are simulated.”*

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Steps to Run
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

### Building for Production
To verify and compile production-ready static assets:
```bash
npm run build
```

---

## 🎬 Demo Mode Presentation Guide for Hackathons

1. **Triage Walkthrough**: Show the Dashboard with calculated metrics. Explain how triage priorities are derived from deterministic rules (e.g. `Rule BP-HYPER`).
2. **Review Action**: Click on a patient with `Pending Review`. Change their status to `Reviewed`, write a note, and save. Notice how the status badge updates immediately on the Dashboard, Patient Directory, and Review Queue.
3. **Data Quality Demonstration**:
   - Open **Demo Mode** from the top bar or sidebar.
   - Select **Scenario B (Missing/Stale Telemetry)**.
   - Navigate to **Health Monitoring** or **Data & Model Status** to show how missing values are preserved as nulls with dashed lines rather than 0.
4. **Acute Trigger Demonstration**:
   - Select **Scenario C** and click **Play Stream**.
   - As telemetry reaches Step 5 (Heart Rate 124 bpm), an alert toast appears with a direct shortcut to **Doctor Review**.
5. **What-If Sandbox**: Open the **What-If Simulator**, test different sleep or exercise parameters, and emphasize the educational disclaimer.
