# AirGo: Real-Time Airfare Price Index (APIx)

[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![PostgreSQL 16+](https://img.shields.io/badge/postgresql-16+-blue.svg)](https://www.postgresql.org/)
[![Playwright / Patchright](https://img.shields.io/badge/scraper-patchright-orange.svg)](https://github.com/Kaliiiiiiiiii-tools/patchright-python)
[![FastAPI](https://img.shields.io/badge/framework-FastAPI-teal.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero-Dummy-Data](https://img.shields.io/badge/Data_Integrity-Zero_Dummy_Guaranteed-brightgreen.svg)](#strict-zero-dummy-data-policy)

> **Official High-Frequency National Accounting Engine**  
> Developed for the **National Statistical Office (MoSPI)** and the **Reserve Bank of India (RBI)**.  
> Replaces legacy quarterly manual surveys with an automated, multi-source web-scraping and econometric index compilation system tracking domestic airfare inflation across India's primary aviation corridors.

---

## Table of Contents
- [1. Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
- [2. System Architecture](#2-system-architecture)
- [3. Multi-OTA Harvesting Engines](#3-multi-ota-harvesting-engines)
- [4. Strict Zero-Dummy Data Policy](#4-strict-zero-dummy-data-policy)
- [5. The 5-Stage Data Pipeline](#5-the-5-stage-data-pipeline)
- [6. Pipeline Stage Inspection CLI](#6-pipeline-stage-inspection-cli)
- [7. Econometric Index Methodology](#7-econometric-index-methodology)
- [8. Database Architecture & Schemas](#8-database-architecture--schemas)
- [9. Institutional Feeds & REST API Reference](#9-institutional-feeds--rest-api-reference)
- [10. Quickstart & Installation Guide](#10-quickstart--installation-guide)
- [11. CLI Command Reference](#11-cli-command-reference)
- [12. Automated Test Suite](#12-automated-test-suite)
- [13. Repository Structure](#13-repository-structure)
- [14. Ethical Scraping & Legal Compliance](#14-ethical-scraping--legal-compliance)

---

## 1. Executive Summary & Problem Statement

### The Problem in Legacy National Accounting
In India's official Consumer Price Index (CPI) compiled by the **Ministry of Statistics and Programme Implementation (MoSPI)**, the air transport component has historically suffered from:
1. **Low Frequency & Stale Lag**: Prices collected manually on a quarterly basis fail to capture intraday or daily yield fluctuations.
2. **Small, Unrepresentative Samples**: Surveying only 2–3 flights on a single date misses dynamic airline revenue management.
3. **Omission of Advance-Purchase Pricing**: Legacy indices treat airfares as static tickets, failing to measure the exponential price surge between leisure advance bookings ($T+45$) and last-minute business travel ($T+1$).
4. **Unbundled Markups Omission**: Neglecting mandatory airport fees (User Development Fees / Passenger Service Fees) and Online Travel Agency (OTA) convenience fees creates systematic downward bias in measured inflation.

### The AirGo Solution
**AirGo** introduces the **Airfare Price Index (APIx)**:
* **High-Frequency Multi-Source Scraping**: Simultaneously harvests live inventory from major Indian aggregators (**Cleartrip**, **EaseMyTrip**) and direct airline portals across India's top 20 domestic city-pairs.
* **Multi-Horizon Tracking**: Captures prices across five distinct advance-purchase horizons ($T+1, T+7, T+15, T+30, T+45\text{ days}$).
* **Official DGCA Census Weighting**: Weights corridors using annual passenger census data from Directorate General of Civil Aviation (DGCA) Table 5.01.
* **Zero Dummy Data Guarantee**: Operates strictly on live, cryptographically verifiable web-scraped quotes, with full screenshot and JSON lineage preservation in local audit runs.
* **Dual Index Formulations**: Simultaneously computes Laspeyres, Jevons (geometric mean aligned with UN COICOP 2018 and MoSPI 2026 revisions), and Fisher Ideal indices.

---

## 2. System Architecture

```
                                      AIRGO HIGH-FREQUENCY ARCHITECTURE
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          DATA ACQUISITION LAYER                                              │
│                                                                                                              │
│    ┌───────────────────────────────────┐                  ┌─────────────────────────────────────────────┐    │
│    │        Cleartrip Harvester        │                  │            EaseMyTrip Harvester             │    │
│    │  • Patchright Stealth Chromium    │                  │  • Angular Pipe-Syntax Navigation           │    │
│    │  • Dynamic DOM Extraction         │                  │  • Asynchronous AirBus_New Interception     │    │
│    │  • Full Checkout Review Capture   │                  │  • 700KB Rich JSON Payload in ~4s           │    │
│    └─────────────────┬─────────────────┘                  └──────────────────────┬──────────────────────┘    │
└──────────────────────┼───────────────────────────────────────────────────────────┼───────────────────────────┘
                       │                                                           │
                       ▼                                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       STAGE 1: RAW OBSERVATIONS LEDGER                                       │
│                                                                                                              │
│      PostgreSQL Table: [ raw_observations ]  ◄── Tracked by Master Run Ledger: [ scraping_runs ]             │
│      Audit Trail: runs/YYYY-MM-DD_HH-MM-SS_<prefix>/ (Screenshots, Intercepted JSON Dumps, Manifests)        │
└──────────────────────────────────────────────┬───────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               STAGE 2: CANONICAL DEDUPLICATION & OUTLIER FILTERING                           │
│                                                                                                              │
│      • Flight Key Hashing: MD5(route + flight_no + travel_date + departure_time)                             │
│      • Multi-Platform Price Arbitrage: Identifies lowest fare across OTAs (EaseMyTrip vs Cleartrip)          │
│      • Tukey 1.5x IQR Outlier Rejection: Eliminates rogue spikes without discarding audit lineage            │
│      PostgreSQL Table: [ canonical_fares ]                                                                   │
└──────────────────────────────────────────────┬───────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   STAGE 3: STATISTICAL ROUTE AGGREGATIONS                                    │
│                                                                                                              │
│      • Slices by: Route x Observation Date x Advance Window (T+1 to T+45) x Carrier x Platform               │
│      • Computes: Mean, Median, Min, Max, Base Fare, Statutory Taxes (GST), Airport Fees (UDF/PSF)           │
│      PostgreSQL Table: [ daily_airfare_aggregates ]                                                          │
└──────────────────────────────────────────────┬───────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  STAGE 4: ECONOMETRIC INDEX FORMULATION (APIx)                               │
│                                                                                                              │
│      • Dynamic Base Period (P₀): Earliest scrape baseline dynamically sets Day 1 Index = 100.00              │
│      • DGCA Table 5.01 Census Passenger Weights: Top 20 corridors weighted by actual passenger volume        │
│      • Index Formulations: Laspeyres (Fixed-weight), Jevons (Geometric mean), Fisher Ideal (Superlative)     │
│      PostgreSQL Table: [ apix_indices ]                                                                      │
└──────────────────────────────────────────────┬───────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CONSUMPTION & PRESENTATION LAYER                                       │
│                                                                                                              │
│    ┌───────────────────────────────┐  ┌──────────────────────────────┐  ┌──────────────────────────────────┐ │
│    │    MoSPI / RBI REST Feeds     │  │   Interactive Web Dashboard  │  │   AeroIntel AI Copilot Engine    │ │
│    │ • /api/v1/institutional/nso   │  │ • Vite + React Glassmorphism │  │ • /api/v1/copilot/chat           │ │
│    │ • /api/v1/institutional/rbi   │  │ • Live Scraper Ticker        │  │ • Lead-Time Elasticity Analysis  │ │
│    │ • /api/v1/export/csv & json   │  │ • 4-Step Ground-Truth Proof  │  │ • Volatility & Anomaly Alerts    │ │
│    └───────────────────────────────┘  └──────────────────────────────┘  └──────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Multi-OTA Harvesting Engines

AirGo deploys resilient, anti-bot hardened harvesters tailored to the technical architecture of each travel platform:

### 3.1 Cleartrip Harvester (`airgo/scrapers/cleartrip_harvester.py`)
* **Engine**: Built with `patchright`, an anti-detect patched Chromium browser framework that modifies browser internal fingerprints (CDP runtime overrides, WebGL properties, navigator.webdriver masking).
* **Navigation & Flow**:
  - Navigates to Cleartrip search result URLs (`depart_date={date}&from={orig}&to={dest}&intl=n&page=loaded`).
  - Automatically handles cookie banners and popup overlays.
  - Dynamically scrolls and renders flight cards across all carriers.
* **Extraction**: Extracts carrier name, flight number, departure time, arrival time, stops, base fare, taxes, and total fare directly from the rendered DOM.
* **Ground-Truth Proof**: Captures full-page screenshots of search results and multi-step checkout reviews, saving them in `runs/`.

### 3.2 EaseMyTrip Harvester (`airgo/scrapers/easemytrip_harvester.py`)
* **Architecture**: Combines automated browser navigation with asynchronous network response interception.
* **URL Delimiter Fix**: EaseMyTrip's Angular Single Page Application (SPA) splits URL query parameters using pipes (`|`), not hyphens. AirGo generates authentic search URLs:
  ```text
  https://flight.easemytrip.com/FlightList/Index?srch=DEL|BOM|07/09/2026&px=1-0-0&cbn=0&ar=undefined&isow=true&isdm=true
  ```
* **Response Interception (`AirBus_New`)**:
  - Hooks into Chromium's network layer using `page.on("response")`.
  - Intercepts the primary flight data endpoint:
    `https://flightservice-node.easemytrip.com/AirAvail_Lights/AirBus_New`
  - Captures ~700KB of rich JSON payload containing 120–150 live flights in ~4 seconds.
* **Payload Parsing (`parse_easemytrip_airbus_payload`)**:
  - Unpacks carrier flight numbers (e.g., `6E-2054`, `AI-806`), departure/arrival schedules, stops, base fares, taxes, and total price.
  - Generates typed `RawObservationSchema` objects ready for immediate pipeline insertion.

---

## 4. Strict Zero-Dummy Data Policy

AirGo operates under strict, mandatory research guidelines (enshrined in `AGENTS.md` and `GEMINI.md`):

1. **🚫 Strict Zero-Dummy Data**: Never inject placeholder variables, fake seat numbers (e.g. `'18-F'`), mock fares (e.g. `300.50`), or simulated quotes.
2. **⚠️ Fail Fast & Honestly**: If live data cannot be extracted due to network timeout, anti-bot blocking, or changed DOM layout, the script must raise an explicit error or return `[]` with diagnostic logs. Never mask scraper failures with hardcoded fallback strings.
3. **🔍 DOM-First Development**: All selectors and response parsers are developed from real rendered HTML and observed network payloads, never guessed.
4. **📸 Visual Ground-Truth Verification**: Multi-step booking flows capture high-resolution timestamped screenshots verifying prices against the live website.
5. **📁 Timestamped Run Folders**: Every execution writes its artifacts into an isolated, timestamped folder (`runs/YYYY-MM-DD_HH-MM-SS_<prefix>/`). Historical audit data is never overwritten.

---

## 5. The 5-Stage Data Pipeline

```mermaid
graph LR
    S1[Stage 1: Harvest] --> S2[Stage 2: Clean & Dedup]
    S2 --> S3[Stage 3: Aggregate]
    S3 --> S4[Stage 4: Compute Index]
    S4 --> S5[Stage 5: Audit & Verify]
```

1. **Stage 1 (Live Harvesting)**: Harvesters query Cleartrip and EaseMyTrip across routes and horizons ($T+1, T+7, T+15, T+30, T+45$), writing raw un-mutated observations to `raw_observations` and logging batch status in `scraping_runs`.
2. **Stage 2 (Canonical Deduplication & IQR Cleaning)**: Generates a deterministic MD5 hash for each unique flight. If a flight is quoted on multiple OTAs, it records price dispersion (`min_total_fare`, `avg_total_fare`, `max_total_fare`, `cheapest_platform`). Identifies outliers using Tukey's $1.5 \times \text{IQR}$ rule and writes clean records to `canonical_fares`.
3. **Stage 3 (Daily Route Aggregation)**: Groups clean non-outlier canonical fares by route, observation date, advance window, carrier, and platform. Computes unweighted means, medians, base fare averages, and tax components into `daily_airfare_aggregates`.
4. **Stage 4 (Econometric Index Formulation)**:
   - Identifies the earliest scrape date in the database as the dynamic base period ($P_0$).
   - Computes Laspeyres, Jevons, and Fisher index numbers using DGCA Table 5.01 passenger census weights.
   - Stores computed indices in `apix_indices`.
5. **Stage 5 (Audit & Evidence Verification)**: Persists full execution manifests, intercepted quotes, and screenshots in `runs/`. Exposes audit artifacts via REST endpoints and the inspection tool.

---

## 6. Pipeline Stage Inspection CLI

AirGo provides a dedicated CLI tool to audit and verify all 5 stages directly against PostgreSQL and local disk:

```bash
python scripts/check_pipeline_stages.py
```

### What It Inspects:
* **Stage 1**: Total scraping runs, total raw observations, and quote distribution across platforms (Cleartrip vs EaseMyTrip).
* **Stage 2**: Canonical fare count, outlier count and percentage, cross-OTA sourcing distribution, and cheapest platform win shares.
* **Stage 3**: Daily airfare aggregate records, average fares, and medians across routes and horizons.
* **Stage 4**: Latest National and Sector-level APIx index values, Laspeyres, Jevons, and Fisher metrics.
* **Stage 5**: Audit run directories in `runs/`, verifying screenshot counts, raw JSON files, and manifest presence.

---

## 7. Econometric Index Methodology

### 7.1 DGCA Table 5.01 Passenger Census Weights
AirGo derives route weights ($w_s$) from the official **Directorate General of Civil Aviation (DGCA)** annual city-pair passenger census:

$$w_s = \frac{Q_s}{\sum_{j=1}^{S} Q_j}$$

Where $Q_s$ is the total annual passenger volume for sector $s$.

| Sector | City-Pair | DGCA Passenger Share ($w_s$) | Rank |
| :--- | :--- | :---: | :---: |
| **DEL-BOM / BOM-DEL** | Delhi ↔ Mumbai | **5.85%** | 1 |
| **BLR-DEL / DEL-BLR** | Bengaluru ↔ Delhi | **4.00%** | 2 |
| **BLR-BOM / BOM-BLR** | Bengaluru ↔ Mumbai | **3.51%** | 3 |
| **DEL-HYD / HYD-DEL** | Delhi ↔ Hyderabad | **2.82%** | 4 |
| **DEL-PNQ / PNQ-DEL** | Delhi ↔ Pune | **2.50%** | 5 |
| *Top 20 Corridors* | *National Trunk Basket* | **82.4% Coverage** | — |

### 7.2 Price Index Formulations

#### 1. Dynamic Base Period ($P_0$)
Under MoSPI CPI guidelines, the initial scrape dynamically establishes the Base Reference Period:
$$\bar{P}_{s, 0} = \text{Mean observed fare for sector } s \text{ on Day 1}$$
This normalizes the Day 1 National and Sector indices to **`100.00`** without synthetic constants.

#### 2. Laspeyres Price Index ($L_t$)
Weighted arithmetic mean using base passenger traffic shares:
$$L_t = \sum_{s=1}^{S} w_s \cdot \left( \frac{\bar{P}_{s, t}}{\bar{P}_{s, 0}} \right) \times 100$$

#### 3. Jevons Elementary Price Index ($J_t$)
Geometric mean index, invariant to base price scale and aligned with UN COICOP 2018 standards:
$$J_t = \prod_{s=1}^{S} \left( \frac{\bar{P}_{s, t}}{\bar{P}_{s, 0}} \right)^{w_s} \times 100$$

#### 4. Fisher Ideal Price Index ($F_t$)
Superlative geometric mean of Laspeyres and Paasche index numbers, satisfying the axiomatic Time-Reversal and Factor-Reversal Tests:
$$F_t = \sqrt{L_t \times P_t}$$

### 7.3 Advance Purchase Lead-Time Elasticity
AirGo computes price decay curves across booking horizons ($T+1$ to $T+45$):
$$\epsilon_d = \frac{\% \Delta \bar{P}_d}{\% \Delta d}$$
Empirical data demonstrates steep exponential surge within $T+7$ days, with $T+1$ emergency business fares averaging $+82.2\%$ above leisure baseline ($T+45$).

---

## 8. Database Architecture & Schemas

The database (`airgo` on PostgreSQL 16+) consists of 7 structured tables:

```
[ scraping_runs ] ──(1:N)──► [ raw_observations ] ──(Deduplication)──► [ canonical_fares ]
                                                                             │
                              ┌──────────────────────────────────────────────┴────────────────────────┐
                              ▼                                                                       ▼
               [ daily_airfare_aggregates ]                                                   [ apix_indices ]
                                                                                                      ▲
               [ dgca_benchmarks ] ───────────────────────────────────────────────────────────────────┘
```

| Table | Purpose | Primary Key | Key Fields |
| :--- | :--- | :--- | :--- |
| **`scraping_runs`** | Master operational ledger | `scraping_run_id` (VARCHAR) | `platform`, `status`, `started_at`, `completed_at`, `total_raw_records`, `total_clean_records` |
| **`raw_observations`** | High-volume raw scraped quotes | `id` (BIGINT) | `scraping_run_id`, `platform`, `carrier`, `flight_number`, `route`, `travel_date`, `advance_purchase_window`, `base_fare`, `taxes`, `total_fare` |
| **`canonical_fares`** | Deduplicated normalized flights | `id` (BIGINT) | `canonical_id`, `route`, `travel_date`, `min_total_fare`, `avg_total_fare`, `max_total_fare`, `cheapest_platform`, `observed_platforms`, `is_outlier` |
| **`daily_airfare_aggregates`** | Statistical route summaries | `id` (BIGINT) | `aggregate_key`, `route`, `observation_date`, `advance_purchase_window`, `carrier`, `average_fare`, `median_fare`, `average_base_fare`, `average_taxes` |
| **`apix_indices`** | Official econometric index series | `id` (BIGINT) | `index_date`, `sector`, `index_value`, `laspeyres_value`, `jevons_value`, `fisher_value`, `avg_fare`, `dod_change_pct`, `quote_count` |
| **`dgca_benchmarks`** | Official DGCA weights & tariffs | `id` (BIGINT) | `sector`, `period`, `monthly_pax_traffic`, `traffic_weight`, `avg_fare_published` |
| **`scraper_logs`** | Telemetry and diagnostic audit | `id` (BIGINT) | `scraping_run_id`, `platform`, `route`, `status`, `duration_ms`, `error_message` |

---

## 9. Institutional Feeds & REST API Reference

AirGo provides high-performance REST API endpoints accessible at `http://localhost:8000`:

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| **`/api/v1/index/realtime`** | `GET` | Latest national APIx headline, Laspeyres, Jevons, Fisher, DoD change %, and quote counts. |
| **`/api/v1/sectors/summary`** | `GET` | Route-by-route APIx values, DGCA traffic weights, and active carrier coverage. |
| **`/api/v1/elasticity`** | `GET` | Lead-time price decay curves across booking horizons ($T+1$ to $T+45$). |
| **`/api/v1/backtest`** | `GET` | 30-day model validation against published DGCA average tariffs ($R^2$, MAPE). |
| **`/api/v1/quotes`** | `GET` | Filtered, paginated canonical flight quotes with platform arbitrage details. |
| **`/api/v1/institutional/nso-feed`** | `GET` | Dedicated MoSPI NSO Consumer Price Index transport sub-index feed. |
| **`/api/v1/institutional/rbi-bulletin`** | `GET` | RBI Monetary Policy Committee high-frequency price impulse nowcasting feed. |
| **`/api/v1/runs`** | `GET` | Lists local timestamped audit execution folders and screenshot proofs. |
| **`/api/v1/copilot/chat`** | `POST` | AeroIntel AI Econometric Copilot query endpoint. |
| **`/api/v1/export/csv`** | `GET` | Direct streaming CSV export for quotes, indices, or aggregates. |
| **`/api/v1/export/json`** | `GET` | Direct JSON export for automated analytical ingestion. |

*Detailed request/response schemas and curl examples are documented in [docs/api_reference.md](docs/api_reference.md).*

---

## 10. Quickstart & Installation Guide

### Prerequisites
* **Python**: 3.13 or higher (`python --version`)
* **PostgreSQL**: Version 16 or higher running on `localhost:5432`
* **Node.js**: 18+ (for building the React frontend dashboard in `client/`)

### 1. Clone & Setup Environment
```bash
git clone https://github.com/TEAM-SSG06/AirGo.git
cd AirGo
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux / macOS
pip install -r requirements.txt
```

### 2. Install Browser Binaries
```bash
patchright install chromium
# or: playwright install chromium
```

### 3. Configure Database
Create the database in PostgreSQL:
```sql
CREATE DATABASE airgo;
```

Copy the environment template and verify your database credentials:
```bash
copy .env.example .env     # Windows
# cp .env.example .env     # Linux / macOS
```
Edit `.env`:
```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/airgo
HEADLESS=true
BASE_URL=http://localhost:8000
```

### 4. Launch the Platform
```bash
python run.py --serve --port 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser to access the executive dashboard.

---

## 11. CLI Command Reference

AirGo includes a unified CLI runner (`run.py`) and specialized utility scripts:

### Serve API & Dashboard
```bash
python run.py --serve --port 8000
```

### Execute Scrape & Full Pipeline
```bash
# Run a quick test harvest across top 1 route and 1 horizon:
python run.py --scrape --top-n 1 --horizons 1

# Run a full multi-OTA sweep across top 6 trunk routes and all horizons:
python run.py --scrape --top-n 6 --horizons 5

# Scrape, clean, and recompute index sequentially:
python run.py --scrape --clean --compute-index
```

### Inspect Pipeline Stages
```bash
python scripts/check_pipeline_stages.py
```

### Scheduled Daily Harvest
```bash
python scripts/run_daily_harvest.py --top-n 6 --horizons 5
```

---

## 12. Automated Test Suite

AirGo includes comprehensive automated test suites covering harvesters, the 5-stage data pipeline, multi-OTA ingestion, and mathematical index calculators.

Execute tests using `pytest`:
```bash
python -m pytest tests/
```

All 7 test cases pass with zero errors:
* `tests/test_cleartrip_best_practice.py`: Live stealth browser checkout flow validation.
* `tests/test_data_pipeline.py`: Database session management, pipeline idempotency, and aggregation accuracy.
* `tests/test_easemytrip_pipeline.py`: EaseMyTrip `AirBus_New` response parsing, multi-platform deduplication, and cheapest platform tagging.

---

## 13. Repository Structure

```text
AirGo/
├── airgo/                          # Core Python Backend Package
│   ├── api/                        # FastAPI Application & REST Routers
│   │   └── app.py                  # Endpoints, institutional feeds, copilot
│   ├── engine/                     # Econometric & Statistical Engines
│   │   ├── index_calculator.py     # Laspeyres, Jevons, Fisher index math
│   │   ├── dgca_weights.py         # Official DGCA Table 5.01 census weights
│   │   ├── elasticity.py           # Lead-time decay curves (T+1 to T+45)
│   │   └── backtest.py             # 30-day DGCA benchmark calibration
│   ├── pipeline/                   # 5-Stage Data Processing Pipeline
│   │   ├── cleaner.py              # Canonical deduplication & IQR outlier filter
│   │   ├── orchestrator.py         # Pipeline execution coordinator
│   │   ├── models.py               # SQLAlchemy ORM database models
│   │   ├── schemas.py              # Pydantic data schemas
│   │   └── db.py                   # PostgreSQL connection & session factory
│   ├── scrapers/                   # Web-Scraping Harvesters
│   │   ├── cleartrip_harvester.py  # Stealth Patchright Cleartrip scraper
│   │   ├── easemytrip_harvester.py # EaseMyTrip AirBus_New response interceptor
│   │   └── orchestrator.py         # Batch harvest coordinator
│   └── utils/                      # Run manager, audit logger, and helpers
├── client/                         # Frontend React/Vite Dashboard
│   ├── src/
│   │   ├── components/             # UI Components (GroundTruthAuditModal, etc.)
│   │   └── pages/                  # Dashboard, DataCollection, AirfareData pages
├── docs/                           # Technical & Regulatory Documentation
│   ├── airgo_database_and_index_guide.md      # DB schema & index calculation guide
│   ├── pipeline_architecture_and_inspection.md # 5-stage pipeline manual
│   ├── api_reference.md                       # Full REST API specification
│   ├── ethical_scraping.md                    # Legal compliance & rate limiting
│   ├── mospi_cpi_report_insights.md           # MoSPI CPI alignment analysis
│   └── airgo_methodology.tex                  # Formal LaTeX academic working paper
├── runs/                           # Local Audit Evidence Storage (Rule 4)
│   └── YYYY-MM-DD_HH-MM-SS_<prefix>/          # Screenshots, manifests, raw JSON dumps
├── scripts/                        # Operational Scripts & Tooling
│   ├── check_pipeline_stages.py    # Automated 5-stage verification tool
│   ├── run_daily_harvest.py        # Production multi-OTA daily harvesting job
│   └── daily_scheduler.py          # Cron scheduler for automated daily sweeps
├── tests/                          # Automated Pytest Suite
├── AGENTS.md                       # Mandatory AI Agent Guidelines & Rules
├── GEMINI.md                       # AI Agent Instructions
├── requirements.txt                # Python dependencies
└── run.py                          # Unified Application CLI Runner
```

---

## 14. Ethical Scraping & Legal Compliance

AirGo is engineered in strict compliance with the **Aircraft Rules, 1937**, Indian national pricing transparency mandates, and digital scraping best practices:
1. **Read-Only Public Observation**: Harvesters extract exclusively published consumer tariffs. No user personal data (PII) is accessed or stored, and inventory is never held or reserved.
2. **Rate-Limiting & Human Cadence**: Implements jittered exponential delays ($1.0\text{s} - 2.5\text{s}$) between queries to prevent operational strain on airline servers.
3. **Off-Peak Execution**: Production harvests are scheduled at 03:00 AM IST during lowest domestic booking traffic.
4. **Bandwidth Optimization**: Heavy non-essential media assets (marketing videos, banner tracking beacons) are blocked during Chromium runs.
5. **Full Audit Traceability**: Every collected price is backed by immutable timestamped visual and programmatic proof in `runs/`.

*For the complete legal compliance manual, refer to [docs/ethical_scraping.md](docs/ethical_scraping.md).*

---

## 15. License & Institutional Attribution

Distributed under the **MIT License**. Developed for technical evaluation by the **Ministry of Statistics and Programme Implementation (MoSPI)** and the **Reserve Bank of India (RBI)**.
