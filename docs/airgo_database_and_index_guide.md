# AirGo: Database Schema, Index Calculation & Output Guide

> **Official System Reference Manual**  
> **Applies to:** AirGo Real-Time Airfare Price Index (APIx) Engine  
> **Target Audiences:** MoSPI (NSO) Price Statistics Division, RBI Monetary Policy Department, System Auditors.

---

## 1. Exactly What Index Was Calculated?

The **Airfare Price Index (APIx)** is a high-frequency real-time index tracking airfare price fluctuations across India's domestic passenger aviation network.

In our latest production cycle, the system evaluated **1,024 live flight quotes** across **6 major DGCA sectors** to generate the following indices:

### 1.1 National Composite Index Values (First Scrape Base Period: 2026-09-06)

Under official MoSPI CPI methodology, when an index series is initiated, the **First Scrape establishes the Base Reference Period ($P_0$)**, with the Base Day index normalized to **`100.00`** across all elementary aggregates and national composites:

| Metric | Computed Value | Mathematical Methodology |
| :--- | :--- | :--- |
| **APIx National Headline** | **100.00** | Initial Base Reference Period Index ($t=0$, First Scrape Baseline) |
| **Laspeyres Index** | **100.00** | Weighted arithmetic mean using official DGCA Table 5.01 passenger traffic weights |
| **Jevons Index** | **100.00** | Chained Geometric Mean (matches MoSPI Jan 2026 CPI revision mandate) |
| **Fisher Ideal Index** | **100.00** | Geometric mean of Laspeyres and Paasche composites: $\sqrt{I_L \times I_P}$ |
| **National Average Fare** | **₹8,284.12** | Observed unweighted mean ticket price across all captured routes on Base Day |
| **Quotes Sample Size** | **1,034** | Real flight observations retained after IQR outlier filtering |
| **Day-on-Day (DoD) Change** | **0.0%** (Baseline) | Initial period reference point for future inflation tracking |

### 1.2 Sector-Level Breakdown (Base Day Values)

Every sector's first scrape average fare ($\bar{P}_{s, 0}$) is dynamically captured as its baseline ($P_0$), establishing an authentic **`100.00`** base with zero hardcoded numbers:

| Sector (City-Pair) | Base Day Index | Quotes | First Scrape Base Fare ($P_0$) | DGCA Traffic Weight ($w_r$) |
| :--- | :--- | :--- | :--- | :--- |
| **BOM-DEL** (Mumbai → Delhi) | **100.00** | 216 | ₹6,870.84 | 5.85% (DGCA Table 5.01 Rank 1) |
| **BLR-DEL** (Bengaluru → Delhi) | **100.00** | 202 | ₹8,966.59 | 4.00% (DGCA Table 5.01 Rank 2) |
| **BLR-BOM** (Bengaluru → Mumbai) | **100.00** | 210 | ₹7,920.70 | 3.51% (DGCA Table 5.01 Rank 3) |
| **DEL-HYD** (Delhi → Hyderabad) | **100.00** | 196 | ₹8,782.61 | 2.82% (DGCA Table 5.01 Rank 4) |
| **DEL-PNQ** (Delhi → Pune) | **100.00** | 208 | ₹9,141.81 | 2.50% (DGCA Table 5.01 Rank 5) |
| **DEL-BOM** (Delhi → Mumbai) | **100.00** | 2 | ₹5,450.00 | 5.85% (DGCA Table 5.01 Rank 1) |

---

## 2. Where Can You See the Output?

AirGo exposes its calculated indices and audit evidence through four accessible interfaces:

### 2.1 Live REST API Endpoints (`http://localhost:8000`)
Start the server with `python run.py --serve` or `uvicorn airgo.api.app:app`:

1. **Real-Time National Index:**
   * **URL:** `GET http://localhost:8000/api/v1/index/realtime`
   * **Payload:** Latest national APIx, Laspeyres, Jevons, Fisher, DoD change %, and total quote counts.
2. **Sector-Wise Index Breakdown:**
   * **URL:** `GET http://localhost:8000/api/v1/sectors/summary`
   * **Payload:** Route-by-route APIx values, traffic weights, and carrier coverage.
3. **Lead-Time Price Elasticity:**
   * **URL:** `GET http://localhost:8000/api/v1/elasticity/curve?sector=BOM-DEL`
   * **Payload:** Price progression curves across booking windows ($T+1, T+7, T+15, T+30, T+45$).
4. **DGCA 30-Day Benchmark Validation:**
   * **URL:** `GET http://localhost:8000/api/v1/backtest/validate`
   * **Payload:** Model backtest comparison against published DGCA average fares (MAPE & correlation).
5. **Direct Data Export for MoSPI & RBI:**
   * **CSV Export:** `GET http://localhost:8000/api/v1/export/csv` (instantly downloads standard CSV).
   * **JSON Export:** `GET http://localhost:8000/api/v1/export/json` (full machine-readable JSON format).

### 2.2 PostgreSQL Database (`localhost:5432`, Database: `airgo`)
All tables can be directly queried via `psql`, pgAdmin, or Python:
```bash
python -c "
from airgo.pipeline.db import get_db_session
from airgo.pipeline.models import APIxIndexDB
with get_db_session() as s:
    for row in s.query(APIxIndexDB).order_by(APIxIndexDB.created_at.desc()).limit(7).all():
        print(row.sector, row.index_value, row.quote_count, row.avg_fare)
"
```

### 2.3 Timestamped Audit Run Folders (`runs/`)
Every pipeline execution saves raw ground-truth proof inside `runs/YYYY-MM-DD_HH-MM-SS_<prefix>/`:
* **`pipeline_result.json`**: Complete execution manifest with quote counts, status, and processing times.
* **`audited_cleartrip_quotes.json`**: Full list of un-mutated scraped flight quotes.
* **`<route>/<horizon>/search_results.png`**: High-resolution browser screenshots verifying what was rendered on screen.

### 2.4 Interactive Web Dashboard
* Built with modern React/Vite in `client/` and accessible at `http://localhost:8000/` or `http://localhost:8000/dashboard`.
* Visualizes real-time index meters, historical trend charts, advance purchase elasticity curves, and sector heatmaps.

---

## 3. Database Architecture: Purpose of Each Table

The AirGo relational database (`airgo` on PostgreSQL 18) consists of 7 structured tables designed for strict data lineage, zero dummy data auditability, and analytical query performance:

```
[ scraping_runs ]
       │ 1
       │
       ▼ *
[ raw_observations ]  ──(Deduplication & Cleaning)──► [ canonical_fares ]
                                                              │
               ┌──────────────────────────────────────────────┴────────────────────────┐
               ▼                                                                       ▼
[ daily_airfare_aggregates ]                                                   [ apix_indices ]
 (Grouped by route, window, carrier)                                         (Laspeyres, Jevons, Fisher)
                                                                                       ▲
[ dgca_benchmarks ]  ──────────────────────────────────────────────────────────────────┘
 (Historical 30-day passenger traffic weights & tariffs)
```

---

### Table 1: `scraping_runs`
* **Purpose:** Acts as the master operational ledger. Tracks every scraper run, execution timestamp, target platform, route counts, and run health.
* **Key Columns:**
  * `scraping_run_id` (VARCHAR, Unique): Unique identifier (e.g. `run_cleartrip_20260906_144903`).
  * `platform` (VARCHAR): Target OTA or Airline (e.g., `Cleartrip`, `EaseMyTrip`, `IndiGo`).
  * `started_at` / `completed_at` (TIMESTAMP): Execution duration tracking.
  * `status` (VARCHAR): `RUNNING`, `SUCCESS`, or `FAILED`.
  * `routes_count`, `total_raw_records`, `total_clean_records` (INT): Yield metrics.

---

### Table 2: `raw_observations` (High Volume Ledger)
* **Purpose:** Stores the exact, raw, un-mutated price quotes extracted directly from OTA/airline search results before any deduplication or outlier filtering. Complies with the **Strict Zero-Dummy Data Policy** (Rule 1).
* **Key Columns:**
  * `id` (BIGINT, PK): Auto-increment primary key.
  * `scraping_run_id` (FK): Links to `scraping_runs`.
  * `platform` (VARCHAR): Platform of origin (`Cleartrip`, `EaseMyTrip`).
  * `carrier` & `flight_number` (VARCHAR): e.g. `IndiGo`, `6E-201`.
  * `origin`, `destination`, `route` (VARCHAR): e.g. `BOM`, `DEL`, `BOM-DEL`.
  * `observation_date` & `travel_date` (DATE): When the price was seen vs when flight flies.
  * `advance_purchase_days` & `advance_purchase_window` (INT, VARCHAR): e.g. `7`, `T+7`.
  * `base_fare`, `taxes`, `fees`, `convenience_fee`, `total_fare` (FLOAT): Fare disaggregation.
  * `source_url` (VARCHAR): Live audit URL.
  * `raw_payload` (JSON): Raw JSON or parsed DOM attributes.

---

### Table 3: `canonical_fares` (Normalized & Cleaned)
* **Purpose:** The single source of truth for deduplicated, normalized airfares. If the same flight (e.g., `AI-806` on 2026-09-13 at 08:00) is quoted across multiple OTAs, this table merges them, selects the cheapest platform, and flags IQR statistical outliers.
* **Key Columns:**
  * `canonical_id` (VARCHAR, Unique): Composite hash: `{route}_{flight_number}_{travel_date}_{departure_time}`.
  * `min_total_fare`, `avg_total_fare`, `max_total_fare` (FLOAT): Price dispersion metrics.
  * `cheapest_platform` (VARCHAR): Identifies lowest-cost booking channel.
  * `platform_count` & `observed_platforms` (INT, VARCHAR): Number and list of platforms offering this seat.
  * `is_outlier` (BOOLEAN) & `outlier_reason` (VARCHAR): Flags fares exceeding $1.5 \times \text{IQR}$ or $2.0 \times \text{IQR}$.

---

### Table 4: `daily_airfare_aggregates` (Pre-Computed Analytics)
* **Purpose:** Stores pre-computed summary statistics grouped by route, observation date, advance booking horizon, carrier, and platform. Powers dashboard charts and reduces load on the database.
* **Key Columns:**
  * `aggregate_key` (VARCHAR, Unique): e.g. `DEL-BOM_2026-09-06_T+7_ALL_ALL`.
  * `observation_count` & `unique_flights` (INT): Total observations and flights sampled.
  * `average_fare`, `median_fare`, `min_fare`, `max_fare` (FLOAT): Summary statistics.
  * `average_base_fare`, `average_taxes`, `average_fees` (FLOAT): Average cost structure.

---

### Table 5: `apix_indices` (Econometric Output)
* **Purpose:** The primary table consumed by MoSPI (NSO) and the RBI Monetary Policy Committee. Holds the official daily, weekly, and monthly price index values computed using international index number formulas.
* **Key Columns:**
  * `index_date` (DATE): Effective calculation date.
  * `sector` (VARCHAR): `ALL` for National composite, or specific city-pair (`BOM-DEL`).
  * `index_value` (FLOAT): Primary APIx headline index.
  * `laspeyres_value` (FLOAT): Fixed-weight Laspeyres index based on DGCA traffic shares.
  * `jevons_value` (FLOAT): Geometric mean Jevons index (COICOP 2018 / MoSPI 2026 standard).
  * `fisher_value` (FLOAT): Fisher Ideal Index.
  * `dod_change_pct`, `wow_change_pct`, `mom_change_pct` (FLOAT): Day-on-Day, Week-on-Week, Month-on-Month inflation rates.
  * `quote_count` (INT): Number of underlying flight quotes used in calculation.

---

### Table 6: `dgca_benchmarks` (Macro Benchmarks & Weights)
* **Purpose:** Stores published Directorate General of Civil Aviation (DGCA) monthly city-pair passenger traffic figures, route revenue passenger kilometers (RPK), and average sector tariffs.
* **Key Columns:**
  * `sector` (VARCHAR): e.g. `DEL-BOM`, `BOM-BLR`.
  * `period` (VARCHAR): Benchmark reference month (e.g. `2024-M01`).
  * `monthly_pax_traffic` (INT): Monthly passenger volume.
  * `traffic_weight` (FLOAT): Normalized weight ($w_r$) in the national composite basket ($\sum w_r = 1.0$).
  * `avg_fare_published` (FLOAT): Published DGCA average fare used for backtest calibration.

---

### Table 7: `scraper_logs` (Telemetry & Worker Auditing)
* **Purpose:** Captures detailed diagnostic telemetry for every individual route/window worker task. If anti-bot challenges (Akamai, Cloudflare) or timeouts occur, this table records the exact error for debugging without failing the entire run.
* **Key Columns:**
  * `scraping_run_id` (FK): Associated scraping batch.
  * `platform`, `route`, `advance_purchase_window` (VARCHAR): Task coordinates.
  * `status` (VARCHAR): `SUCCESS`, `WARNING`, `EMPTY`, or `FAILED`.
  * `duration_ms` (INT): Network and extraction latency in milliseconds.
  * `error_message` (VARCHAR): Diagnostic stack trace snippet.
