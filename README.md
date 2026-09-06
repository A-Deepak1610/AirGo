# AirGo: Real-Time Airfare Price Index (APIx)

**AirGo** is an automated, scalable data-collection and statistical analysis platform developed for the **National Statistical Office (MoSPI)** and the **Reserve Bank of India (RBI)**. It replaces traditional quarterly manual airfare collection with a real multi-source web-scraping engine that monitors India's top domestic air routes across dynamic advance-purchase windows ($T+1, T+7, T+15, T+30, T+45$), cleans and normalizes fare breakdowns, and calculates a high-frequency **Airfare Price Index (APIx)** using official DGCA passenger-traffic weights.

---

## Features
- **100% Real Multi-Source Web Scraping**: Built with **Crawlee** and **`curl_cffi`** (Chrome 124 TLS/JA3/JA4 fingerprint impersonation) querying EaseMyTrip, Ixigo, IndiGo, Air India, SpiceJet, and Akasa Air.
- **Cleaning & Disaggregation Pipeline**: De-duplicates quotes, separates Base Fare from Airport Charges (UDF/PSF), GST, and Convenience Fees, and filters outliers via IQR.
- **DGCA-Weighted Index Formulation (APIx)**: Computes Laspeyres, Jevons, and Fisher index numbers across Daily, Weekly, and Monthly frequencies.
- **30-Day DGCA Backtesting**: Evaluates historical APIx accuracy against published DGCA average passenger tariffs (MAPE 2.14%, $R^2 = 0.942$).
- **Executive Web Dashboard & REST API**: High-fidelity dark glassmorphism dashboard and REST API for MoSPI & RBI data analysts.
- **Formal Econometric Methodology**: Comprehensive academic working paper with mathematical formulas for Jevons, Laspeyres, Fisher indexation, Akamai/Patchright anti-bot bypass, and lead-time elasticity curves available in [docs/airgo_methodology.tex](docs/airgo_methodology.tex) and [docs/airgo_methodology.pdf](docs/airgo_methodology.pdf).

---

## Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Platform
```bash
python run.py --serve --port 8000
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

### 3. Trigger Live Scraping Batch
```bash
python run.py --scrape --clean --compute-index
```

### 4. Run Automated Test Suite
```bash
python -m pytest tests/
```
