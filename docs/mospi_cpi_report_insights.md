# MoSPI Expert Group Report (Jan 2026): Key Insights for Airfare & AirGo (APIx)

> **Document Analyzed:** *Expert Group Report on Comprehensive Updation of Consumer Price Index (Base 2024=100)*  
> **Published:** January 2026  
> **Issuing Body:** Price Statistics Division (PSD), National Statistical Office (NSO), Ministry of Statistics & Programme Implementation (MoSPI), Government of India  
> **Key Participants:** Shri Ashish Kumar (Chair, former DG CSO/UNSIAP), Dr. Brian Graf (Senior Economist, IMF Technical Assistance Mission), Advisers from RBI (DSIM & Monetary Policy Department), Labour Bureau, DPIIT, and Academic Experts (JNU, IIM-A, Ashoka University).

---

## Executive Summary

The Problem Statement for the **Automated Real-Time Airfare Price Index (APIx)** is directly grounded in the official recommendations of this 2026 MoSPI Expert Group Report. Under India's flexible inflation targeting framework, the Consumer Price Index (CPI) compiled by MoSPI serves as the anchor for monetary policy decisions by the Reserve Bank of India (RBI).

Historically, the CPI (2012=100 series) relied on manual "pen-and-paper" price collection from a restricted set of physical ticketing counters. Because more than 90% of domestic Indian air tickets are now booked online via airline portals and Online Travel Aggregators (OTAs), and because dynamic pricing causes fares to fluctuate by 200–400% based on lead time and demand, manual collection failed to capture real consumer expenditure.

The January 2026 report formally mandates the adoption of **alternative data sources**, specifically **automated online data collection / web scraping for airfare**, under the international **COICOP 2018** statistical standard.

---

## High-Level Architecture Mapping

```
                      MoSPI / NSO / RBI / IMF Mandate (CPI 2024=100)
                                            │
        ┌───────────────────────────────────┼──────────────────────────────────┐
        ▼                                   ▼                                  ▼
COICOP 2018 Standard              Data Sourcing & Anti-Bot            Index Methodology & IMF
• Item Code: 07.3.3.1.2.01        • Official Alternative Data        • Jevons Short Index (Chain-Base)
• Class: Passenger transport      • Online Web Scraping endorsed      • Dutot Higher-Level Aggregation
  by air (Domestic & Intl)        • Rate-limiting / Ethical rules    • Missing Price Imputation Rule
• Group 07.3 Weight: 2.567%       • Specific carrier + Tiered SPD     • DGCA 30-day Tariff Benchmarking
```

---

## 1. Official COICOP 2018 Classification & Weight Architecture

* **COICOP 2018 Adoption (Annexure 5.2, p. 101, 107):**
  * **Division 07:** *Transport*  
    *All-India Weight:* **8.7961%** (Rural: 4.7906%, Urban: 4.0055%)
  * **Group 07.3:** *Passenger transport services*  
    *All-India Weight:* **2.5670%** (Rural: 1.4788%, Urban: 1.0882%)
  * **Class 07.3.3:** *Passenger transport by air*
  * **Subclass 07.3.3.1:** *Passenger transport by air, domestic*
  * **Item Code:** `07.3.3.1.2.01` — **Airfare**  
    *(The 6th digit `2` formally designates it as a **Service**, distinct from goods coded with `1`).*

* **HCES Weight Fallback Rule (Para 4.2.3, p. 25):**
  * In the Household Consumption Expenditure Survey (HCES) 2023–24, airfare expenditure was under-reported in certain smaller/non-metro states. The Expert Group mandated borrowing state-level air travel expenditure weights from **HCES 2022–23** to ensure zero gaps in the national composite weighting tree.

---

## 2. Airfare Structured Product Description (SPD) & Booking Horizons

Across the 13 Expert Group meetings and the IMF Technical Assistance Mission, the methodology for airfare evolved substantially:

| Parameter | Initial Proposal (2023) | Intermediate Refinement (2024) | **Final IMF & MoSPI Mandate (2025–2026)** | AirGo System Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **Data Source** | Physical travel agents | Online regional portals | **Centralized Web Scraping of Airlines & OTAs** | IndiGo, Air India, Akasa, SpiceJet, Cleartrip |
| **Route Selection** | Top 3 routes per airport (DGCA) | Top 5 routes for million+ cities | **DGCA Top City-Pairs** (DEL-BOM, DEL-BLR, BOM-BLR, etc.) | DGCA 13 benchmark sectors |
| **Advance Windows** | Fixed 15-day advance | 7-day advance booking | **Multi-Horizon Basket:** $T+1, T+7, T+14, T+21, T+30, T+45$ | Configurable multi-window queries & lead-time elasticity |
| **Flight Specification** | Cheapest available on route | One-way adult non-stop saver | **Specific Carrier + Non-Stop Economy Saver** | Lowest unbundled Economy tier tracked per carrier |
| **Scope of Travel** | Domestic only | Domestic only | **Domestic + Direct International** | System ready for route expansion |

### Key Directive from IMF Expert Dr. Brian Graf (11th Meeting, Para 3.11, p. 219)
> *"The airline is a price-determining characteristic and should be part of the specification. The specification should include a greater variety in terms of timing (14 days, 21 days advance purchase) rather than just selecting the lowest available fare across airlines within a given time slot."*

**Methodological Takeaway:** Selecting only the single cheapest fare across all airlines on a route introduces carrier churn bias (e.g., oscillating between ultra-low-cost carriers and full-service carriers with different amenities). Instead, tracking **carrier-specific fare relatives** across identical booking windows isolates pure price inflation.

---

## 3. IMF Guidance on Web Scraping & Volatility Control (Para 3.20, p. 225)

* **Quote from the Report:**
  > *"With web scraping, it is important to understand whether the prices online reflect actual transaction prices. Also, recent research has shown that web scraping can introduce volatility in the CPI. The growing consensus is that more data is not necessarily better data. Web scraping is commonly used for airlines and hotels."*

* **Direct Architectural Implementation in AirGo:**
  1. **Ancillary & Tax Breakdown:** Fares must reflect the *actual final transaction price paid by the consumer*. AirGo disaggregates Base Fare, User Development Fees (UDF), Passenger Service Fees (PSF), Goods and Services Tax (GST), and Convenience Fees.
  2. **Inter-Quartile Range (IQR) Filtering:** Eliminates anomalous scraping spikes and fare glitches before aggregation.
  3. **Standardized Scraping Cadence:** Scraping occurs at fixed daily off-peak hours (03:00 AM IST) to remove intra-day dynamic pricing noise and prevent server load on target platforms.

---

## 4. Econometric Index Compilation Formulae (Section 4.6, p. 50–59)

The 2026 report introduced two fundamental econometric improvements over the 2012 CPI framework:

### A. Elementary Index: Shift from Long Jevons to Chained Short Jevons
* **Old Formula (CPI 2012 - Long Index):**
  $$I_t = \prod_{i=1}^{n} \left(\frac{p_t^i}{p_0^i}\right)^{\frac{1}{n}} \times 100$$
  *(Overly dependent on fixed base prices $p_0$, creating distortion when flight numbers change).*

* **New Formula (CPI 2024 - Short Chain-Base Jevons):**
  $$I_t = \prod_{i=1}^{n} \left(\frac{p_t^i}{p_{t-1}^i}\right)^{\frac{1}{n}} \times I_{t-1}$$
  * Measures month-to-month / day-to-day relative price movements.
  * Chains indices forward smoothly.
  * Naturally accommodates airline schedule changes, route seasonal entries, and cancellations without requiring base-price recalculation.

### B. Higher-Level Aggregation: Young / Modified Laspeyres & Dutot Method
* **Aggregation Formula (Para 4.6.2.2, p. 53):**
  $$\text{Young's Index} = \sum_{i} w_b^i \left(\frac{I_t^i}{I_0^i}\right)$$
  Where $w_b^i$ represents the HCES expenditure share weight.
* **Higher-Level Imputation (10th Meeting, Para 6.4.2, p. 211–212):**  
  The Expert Group replaced the *Carli method* (which statistically overstates inflation) with the **Dutot method**, satisfying international index properties including time reversal and proportionality.

### C. Treatment of Sold-Out Flights & Missing Quotes (Para 4.6.4.3, p. 56–57)
* When a flight or route is unavailable or sold out in period $t$:
  $$\text{Imputed Price}_t = \text{Price}_{t-1} \times \text{GM}\left(\frac{\text{Price}_t}{\text{Price}_{t-1}}\text{ of available flights in sector}\right)$$
* Eliminates arbitrary weight redistribution, preserving price stability across periods.

---

## 5. Regional Coverage & Non-Airport State Handling (Para 4.4.2, p. 169)

* In states or union territories lacking operational commercial airports (such as Haryana or single-feeder states like Sikkim):
  > *"Airfare for the most popular routes captured in Delhi may be used for compiling the airfare index for Haryana, as air travellers from Haryana use Delhi airport."*
* AirGo incorporates hub mapping to ensure complete geographic representation across all 36 States and Union Territories.

---

## 6. Problem Statement vs. MoSPI Expert Group Alignment Matrix

| MoSPI Expert Group Report (Jan 2026) | Problem Statement Requirement | AirGo Implementation Status |
| :--- | :--- | :--- |
| **Alternative Data Sources for Airfare** | Python scraper (Playwright/Scrapy) | **Implemented**: Patchright & Camoufox anti-bot scrapers. |
| **COICOP 2018 Item `07.3.3.1.2.01`** | Cleaned database with standardized metadata | **Implemented**: `CanonicalFare` schema with COICOP taxonomy. |
| **Multi-Horizon Purchase Windows** | Windows: $T+1, T+7, T+15, T+30, T+45$ | **Implemented**: Query generator supporting all lead times. |
| **Zero Dummy Data & Net Transaction Prices** | Separate Base, Taxes, UDF, Convenience Fees | **Implemented**: Strict Zero Dummy Data policy + fare disaggregation. |
| **Short-Term Chained Jevons Formula** | Real-time Airfare Price Index (APIx) calculation | **Implemented**: `IndexCalculator` supporting Jevons Short & Laspeyres. |
| **DGCA Benchmark Monitoring** | 30-day DGCA backtest comparison | **Implemented**: Seeded `dgca_benchmarks` table & backtest endpoint. |
| **Dissemination to NSO and RBI** | Data API export endpoints | **Implemented**: `/api/v1/export/csv` & `/api/v1/export/json`. |
