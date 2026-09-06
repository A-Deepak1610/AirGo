import os
import csv
from typing import Dict, List, Any

# Path to official DGCA Table 5.01 processed basket
_CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "processed", "dgca_top100_route_basket.csv"
)

# Known DGCA Tariff Monitoring baseline domestic fares (INR) for major corridors (2024 Base Year)
_CORRIDOR_BASELINES: Dict[str, float] = {
    "DEL-BOM": 4850.0, "BOM-DEL": 4850.0,
    "DEL-BLR": 5400.0, "BLR-DEL": 5400.0,
    "BOM-BLR": 3950.0, "BLR-BOM": 3950.0,
    "DEL-CCU": 5100.0, "CCU-DEL": 5100.0,
    "BLR-HYD": 3100.0, "HYD-BLR": 3100.0,
    "MAA-DEL": 5350.0, "DEL-MAA": 5350.0,
    "BOM-GOI": 3300.0, "GOI-BOM": 3300.0,
    "DEL-HYD": 4700.0, "HYD-DEL": 4700.0,
    "BOM-CCU": 5600.0, "CCU-BOM": 5600.0,
    "DEL-PNQ": 4600.0, "PNQ-DEL": 4600.0,
    "DEL-GAU": 5800.0, "GAU-DEL": 5800.0,
    "CCU-BLR": 5200.0, "BLR-CCU": 5200.0,
    "MAA-BOM": 3800.0, "BOM-MAA": 3800.0,
    "DEL-GOI": 5200.0, "GOI-DEL": 5200.0,
    "AMD-DEL": 3600.0, "DEL-AMD": 3600.0,
    "AMD-BOM": 3200.0, "BOM-AMD": 3200.0,
    "BLR-PNQ": 3400.0, "PNQ-BLR": 3400.0,
    "BLR-GOI": 3100.0, "GOI-BLR": 3100.0,
    "HYD-MAA": 3200.0, "MAA-HYD": 3200.0,
    "BLR-COK": 3100.0, "COK-BLR": 3100.0,
    "BLR-MAA": 2800.0, "MAA-BLR": 2800.0,
    "DEL-LKO": 3100.0, "LKO-DEL": 3100.0,
    "GOI-HYD": 3300.0, "HYD-GOI": 3300.0,
    "DEL-PAT": 4600.0, "PAT-DEL": 4600.0,
    "ATQ-DEL": 3200.0, "DEL-ATQ": 3200.0,
    "BOM-JAI": 3800.0, "JAI-BOM": 3800.0,
    "CCU-HYD": 4500.0, "HYD-CCU": 4500.0,
    "DEL-SXR": 4700.0, "SXR-DEL": 4700.0
}


def _load_dgca_routes() -> Dict[str, Dict[str, Any]]:
    """
    Loads official top routes and passenger volume weights dynamically from DGCA Table 5.01 census data.
    Provides bidirectional lookup (e.g. BOM-DEL and DEL-BOM).
    """
    routes: Dict[str, Dict[str, Any]] = {}
    
    if os.path.exists(_CSV_PATH):
        try:
            with open(_CSV_PATH, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    r = row["route"].strip()
                    parts = r.split("-")
                    if len(parts) == 2:
                        c1, c2 = parts[0].strip(), parts[1].strip()
                        pax = int(row["total_pax"])
                        weight = float(row["weight_traffic_within_basket"])
                        base_fare = _CORRIDOR_BASELINES.get(r, 4800.0)

                        meta = {
                            "origin": c1,
                            "destination": c2,
                            "name": f"{row['city1']} - {row['city2']}",
                            "annual_pax": pax,
                            "annual_pax_approx": pax,
                            "traffic_weight": weight,
                            "share_of_national_traffic": float(row.get("share_of_national_traffic", 0.0)),
                            "tier": row.get("tier", "Tier 1"),
                            "rank": int(row.get("rank", 1)),
                            "base_fare_baseline": base_fare,
                            "avg_flight_time_mins": 120
                        }
                        routes[r] = meta
                        
                        # Bidirectional reverse route entry
                        rev_r = f"{c2}-{c1}"
                        if rev_r not in routes:
                            routes[rev_r] = dict(
                                meta,
                                origin=c2,
                                destination=c1,
                                name=f"{row['city2']} - {row['city1']}",
                                base_fare_baseline=_CORRIDOR_BASELINES.get(rev_r, base_fare)
                            )
            return routes
        except Exception:
            pass

    # Fallback to top primary trunk corridors if CSV unavailable
    return {
        "DEL-BOM": {"origin": "DEL", "destination": "BOM", "name": "Delhi - Mumbai", "annual_pax": 6850869, "annual_pax_approx": 6850869, "traffic_weight": 0.0585, "base_fare_baseline": 4850.0, "avg_flight_time_mins": 130},
        "BOM-DEL": {"origin": "BOM", "destination": "DEL", "name": "Mumbai - Delhi", "annual_pax": 6850869, "annual_pax_approx": 6850869, "traffic_weight": 0.0585, "base_fare_baseline": 4850.0, "avg_flight_time_mins": 130},
        "BLR-DEL": {"origin": "BLR", "destination": "DEL", "name": "Bengaluru - Delhi", "annual_pax": 4681042, "annual_pax_approx": 4681042, "traffic_weight": 0.0400, "base_fare_baseline": 5400.0, "avg_flight_time_mins": 165},
        "DEL-BLR": {"origin": "DEL", "destination": "BLR", "name": "Delhi - Bengaluru", "annual_pax": 4681042, "annual_pax_approx": 4681042, "traffic_weight": 0.0400, "base_fare_baseline": 5400.0, "avg_flight_time_mins": 165},
        "BLR-BOM": {"origin": "BLR", "destination": "BOM", "name": "Bengaluru - Mumbai", "annual_pax": 4114574, "annual_pax_approx": 4114574, "traffic_weight": 0.0351, "base_fare_baseline": 3950.0, "avg_flight_time_mins": 100},
        "BOM-BLR": {"origin": "BOM", "destination": "BLR", "name": "Mumbai - Bengaluru", "annual_pax": 4114574, "annual_pax_approx": 4114574, "traffic_weight": 0.0351, "base_fare_baseline": 3950.0, "avg_flight_time_mins": 100}
    }


# Dynamically load from official DGCA Table 5.01 census data
DGCA_ROUTES: Dict[str, Dict[str, Any]] = _load_dgca_routes()
TOTAL_RAW_WEIGHT = sum(r["traffic_weight"] for r in DGCA_ROUTES.values())


ADVANCE_WINDOWS: Dict[str, Dict[str, Any]] = {
    "T+0": {
        "days": 0,
        "description": "Same-Day Travel",
        "weight": 0.10,
        "target_lead_days": 0
    },
    "T+1": {
        "days": 1,
        "description": "Next-Day Travel",
        "weight": 0.25,
        "target_lead_days": 1
    },
    "T+7": {
        "days": 7,
        "description": "1-Week Advance",
        "weight": 0.30,
        "target_lead_days": 7
    },
    "T+15": {
        "days": 15,
        "description": "2-Weeks Advance",
        "weight": 0.20,
        "target_lead_days": 15
    },
    "T+30": {
        "days": 30,
        "description": "1-Month Advance",
        "weight": 0.10,
        "target_lead_days": 30
    },
    "T+45": {
        "days": 45,
        "description": "45-Days Advance",
        "weight": 0.05,
        "target_lead_days": 45
    }
}

INDIAN_AIRLINES: Dict[str, str] = {
    "6E": "IndiGo",
    "AI": "Air India",
    "IX": "Air India Express",
    "SG": "SpiceJet",
    "QP": "Akasa Air",
    "I5": "AIX Connect"
}
