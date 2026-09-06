# AirGo: REST API Specification & Developer Reference

> **API Version:** 1.0.0  
> **Base URL:** `http://localhost:8000` (or configured production host)  
> **Documentation Formats:** OpenAPI 3.0 / Swagger UI at `/docs`, ReDoc at `/redoc`.

---

## 1. Overview & Authentication

The AirGo REST API provides programmatic access to real-time airfare indices, sector aggregations, historical inflation trends, econometric lead-time elasticity curves, and automated export feeds tailored for institutional consumption by the **Ministry of Statistics and Programme Implementation (MoSPI)** and the **Reserve Bank of India (RBI)**.

All endpoints return JSON responses unless a streaming CSV download is specifically requested.

---

## 2. Core APIx Index Endpoints

### 2.1 Get Real-Time Headline Index
* **Endpoint:** `GET /api/v1/index/realtime`
* **Description:** Retrieves the latest computed National Airfare Price Index (APIx) along with Laspeyres, Jevons, and Fisher index values, Day-on-Day (DoD) change %, and summary statistics.
* **Query Parameters:** None.
* **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "index_date": "2026-09-06",
  "national_apix": 100.0,
  "laspeyres": 100.0,
  "jevons": 100.0,
  "fisher": 100.0,
  "avg_fare": 8284.12,
  "median_fare": 8100.0,
  "min_fare": 4200.0,
  "max_fare": 14500.0,
  "dod_change_pct": 0.0,
  "mom_change_pct": 0.0,
  "quote_count": 1034,
  "sector_count": 20
}
```

---

### 2.2 Get Sector Summary Breakdown
* **Endpoint:** `GET /api/v1/sectors/summary`
* **Description:** Returns the route-level breakdown across all monitored city-pairs, including official DGCA Table 5.01 passenger traffic weights, current average fare, baseline fare ($P_0$), index value, and active carriers.
* **Query Parameters:** None.
* **Response (200 OK):**
```json
{
  "sectors": [
    {
      "sector": "DEL-BOM",
      "name": "Delhi - Mumbai",
      "origin": "DEL",
      "destination": "BOM",
      "weight_pct": 5.85,
      "baseline_fare": 6870.84,
      "current_avg_fare": 6870.84,
      "index_value": 100.0,
      "dod_change_pct": 0.0,
      "active_carriers": ["Air India", "IndiGo", "SpiceJet", "Akasa Air"],
      "quote_count": 216,
      "flight_time_mins": 130
    },
    {
      "sector": "BLR-DEL",
      "name": "Bengaluru - Delhi",
      "origin": "BLR",
      "destination": "DEL",
      "weight_pct": 4.00,
      "baseline_fare": 8966.59,
      "current_avg_fare": 8966.59,
      "index_value": 100.0,
      "dod_change_pct": 0.0,
      "active_carriers": ["Air India", "IndiGo", "Akasa Air"],
      "quote_count": 202,
      "flight_time_mins": 165
    }
  ]
}
```

---

### 2.3 Get Lead-Time Price Elasticity Curve
* **Endpoint:** `GET /api/v1/elasticity`
* **Description:** Returns the empirical price decay curve across advance-purchase booking horizons ($T+1, T+7, T+15, T+30, T+45$).
* **Query Parameters:**
  * `sector` (string, optional, default: `"ALL"`): City-pair code (e.g., `DEL-BOM`, `BOM-DEL`, or `ALL`).
* **Response (200 OK):**
```json
{
  "sector": "DEL-BOM",
  "curve_points": [
    {"advance_window": "T+1", "advance_days": 1, "avg_fare": 8450.0, "index_vs_base": 182.2, "quote_count": 48},
    {"advance_window": "T+7", "advance_days": 7, "avg_fare": 6720.0, "index_vs_base": 144.9, "quote_count": 52},
    {"advance_window": "T+15", "advance_days": 15, "avg_fare": 5540.0, "index_vs_base": 119.5, "quote_count": 44},
    {"advance_window": "T+30", "advance_days": 30, "avg_fare": 4680.0, "index_vs_base": 101.0, "quote_count": 38},
    {"advance_window": "T+45", "advance_days": 45, "avg_fare": 4637.0, "index_vs_base": 100.0, "quote_count": 34}
  ],
  "interpretation": "Prices show steep exponential yield surge inside T+7 days."
}
```

---

### 2.4 Get 30-Day DGCA Benchmark Validation
* **Endpoint:** `GET /api/v1/backtest`
* **Description:** Executes statistical validation comparing AirGo APIx index trajectories against published DGCA average passenger tariffs.
* **Query Parameters:** None.
* **Response (200 OK):**
```json
{
  "status": "VALIDATED",
  "sample_size_days": 30,
  "mape_pct": 2.14,
  "r_squared": 0.942,
  "correlation": 0.971,
  "conformance_status": "HIGH_CONFIDENCE",
  "methodology": "DGCA Form 5.01 Census Tariff Alignment"
}
```

---

## 3. Flight Quotes & Search

### 3.1 Get Filtered Flight Quotes
* **Endpoint:** `GET /api/v1/quotes`
* **Description:** Searches and paginates cleaned canonical airfare quotes with platform arbitrage and IQR outlier flags.
* **Query Parameters:**
  * `sector` (string, optional): Route code (e.g. `DEL-BOM`).
  * `carrier` (string, optional): Carrier name (e.g. `IndiGo`, `Air India`).
  * `advance_window` (string, optional): Horizon (`T+1`, `T+7`, `T+15`, `T+30`, `T+45`).
  * `limit` (int, default: 100): Results per page.
  * `offset` (int, default: 0): Pagination offset.
* **Response (200 OK):**
```json
{
  "count": 107,
  "offset": 0,
  "limit": 10,
  "quotes": [
    {
      "id": 1,
      "canonical_id": "c7a8f6d5e9b14c32890123456789abcd",
      "sector": "DEL-BOM",
      "origin": "DEL",
      "destination": "BOM",
      "carrier": "IndiGo",
      "flight_number": "6E-2054",
      "departure_date": "2026-09-07",
      "departure_time": "06:15",
      "advance_window": "T+1",
      "advance_days": 1,
      "base_fare": 4650.0,
      "taxes_and_fees": 1779.0,
      "total_fare": 6429.0,
      "min_fare": 6429.0,
      "max_fare": 6580.0,
      "source_url": "https://www.google.com/travel/flights?q=Flights%20to%20BOM%20from%20DEL%20on%202026-09-07%20one%20way",
      "is_outlier": false,
      "sources": "Cleartrip, EaseMyTrip",
      "platform_count": 2,
      "cheapest_platform": "EaseMyTrip"
    }
  ]
}
```

---

## 4. Institutional NSO & RBI Feeds

### 4.1 NSO CPI Transport Sub-Index Feed
* **Endpoint:** `GET /api/v1/institutional/nso-feed`
* **Description:** Dedicated JSON feed engineered specifically for the MoSPI National Statistical Office (NSO) Consumer Price Index compilation unit.
* **Response (200 OK):**
```json
{
  "status": "OFFICIAL_RELEASE",
  "issuing_authority": "AirGo for Ministry of Statistics and Programme Implementation (MoSPI)",
  "intended_consumer": "National Statistical Office (NSO) - CPI Central Compilation Unit",
  "index_date": "2026-09-06",
  "base_period": "First Scrape Baseline = 100.0",
  "basket_specifications": {
    "representative_city_pairs": 20,
    "traffic_coverage_pct": 82.4,
    "advance_windows": ["T+1", "T+7", "T+15", "T+30", "T+45"],
    "cleaning_standard": "Tukey 1.5x IQR Outlier Rejection with Zero Dummy Data"
  },
  "headline_indices": {
    "laspeyres": 100.0,
    "jevons": 100.0,
    "fisher_ideal": 100.0,
    "dod_change_pct": 0.0,
    "mom_change_pct": 0.0
  },
  "component_fare_disaggregation_inr": {
    "average_base_fare": 5820.0,
    "statutory_taxes_gst": 850.0,
    "user_development_fee_udf_psf": 640.0,
    "ota_convenience_charge": 350.0,
    "total_effective_fare": 7660.0
  }
}
```

---

### 4.2 RBI Monetary Policy High-Frequency Feed
* **Endpoint:** `GET /api/v1/institutional/rbi-bulletin`
* **Description:** High-frequency nowcasting bulletin feed for the Reserve Bank of India Department of Economic and Policy Research (DEPR).
* **Response (200 OK):**
```json
{
  "status": "LIVE_TRANSMISSION",
  "intended_recipient": "Reserve Bank of India - Department of Economic and Policy Research (DEPR)",
  "bulletin_frequency": "Daily Real-Time High-Frequency Nowcasting",
  "timestamp": "2026-09-06T18:00:00Z",
  "headline_price_impulse": {
    "annualized_airfare_inflation_pct": 14.8,
    "mom_momentum_pct": 3.8,
    "volatility_dispersion_sigma": 3.45,
    "underlying_trend": "Firm yield management pricing on metro trunk corridors"
  }
}
```

---

## 5. Data Export Endpoints

### 5.1 CSV Stream Export
* **Endpoint:** `GET /api/v1/export/csv?dataset={dataset}`
* **Parameters:**
  * `dataset` (string): Options: `quotes` (default), `indices`, `aggregates`.
* **Response:** Streaming `text/csv` file with standard HTTP `Content-Disposition: attachment`.

### 5.2 JSON Batch Export
* **Endpoint:** `GET /api/v1/export/json?dataset={dataset}`
* **Parameters:**
  * `dataset` (string): Options: `quotes` (default), `indices`, `aggregates`.
* **Response:** Formatted JSON containing record array and total count.

---

## 6. Audit & Scraper Management

### 6.1 List Scraped Runs
* **Endpoint:** `GET /api/v1/runs?limit=25`
* **Description:** Lists timestamped execution audit folders located in `runs/`, including screenshot counts and raw JSON payloads.

### 6.2 Get Run Audit Details
* **Endpoint:** `GET /api/v1/runs/{run_folder}`
* **Description:** Fetches full multi-step ground truth evidence and quotes for a specific run.

### 6.3 AeroIntel AI Econometric Copilot
* **Endpoint:** `POST /api/v1/copilot/chat`
* **Request Body:**
```json
{
  "message": "Analyze T+1 surge on DEL-BOM",
  "route": "DEL-BOM",
  "horizon": "T+1"
}
```
* **Response (200 OK):**
```json
{
  "reply": "### ⚠️ Dynamic Pricing & Urgent Surge Analysis\n...",
  "metrics": {
    "route": "DEL-BOM",
    "t1_surge_pct": 82.2,
    "volatility_score": 4.2,
    "outlier_fence": 10250,
    "status": "ELEVATED_SURGE"
  },
  "suggested_actions": ["Inspect T+1 Lead-Time Curve", "View Volatility Ranking", "Check Platform Spreads"]
}
```
