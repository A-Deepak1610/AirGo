import os
import csv
from typing import Dict, List, Any

# Path to official DGCA Table 5.01 processed basket
_CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "processed", "dgca_top100_route_basket.csv"
)

def _load_dgca_routes() -> Dict[str, Dict[str, Any]]:
    """
    Loads official top routes and passenger volume weights dynamically from DGCA Table 5.01 census data.
    Provides bidirectional lookup (e.g. BOM-DEL and DEL-BOM).
    Zero hardcoded baseline prices: baseline prices are derived from actual first scraped observations.
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
                                name=f"{row['city2']} - {row['city1']}"
                            )
            return routes
        except Exception:
            pass

    # Fallback to top primary trunk corridors from census if CSV is missing
    return {
        "DEL-BOM": {"origin": "DEL", "destination": "BOM", "name": "Delhi - Mumbai", "annual_pax": 6850869, "annual_pax_approx": 6850869, "traffic_weight": 0.0585, "avg_flight_time_mins": 130},
        "BOM-DEL": {"origin": "BOM", "destination": "DEL", "name": "Mumbai - Delhi", "annual_pax": 6850869, "annual_pax_approx": 6850869, "traffic_weight": 0.0585, "avg_flight_time_mins": 130},
        "BLR-DEL": {"origin": "BLR", "destination": "DEL", "name": "Bengaluru - Delhi", "annual_pax": 4681042, "annual_pax_approx": 4681042, "traffic_weight": 0.0400, "avg_flight_time_mins": 165},
        "DEL-BLR": {"origin": "DEL", "destination": "BLR", "name": "Delhi - Bengaluru", "annual_pax": 4681042, "annual_pax_approx": 4681042, "traffic_weight": 0.0400, "avg_flight_time_mins": 165},
        "BLR-BOM": {"origin": "BLR", "destination": "BOM", "name": "Bengaluru - Mumbai", "annual_pax": 4114574, "annual_pax_approx": 4114574, "traffic_weight": 0.0351, "avg_flight_time_mins": 100},
        "BOM-BLR": {"origin": "BOM", "destination": "BLR", "name": "Mumbai - Bengaluru", "annual_pax": 4114574, "annual_pax_approx": 4114574, "traffic_weight": 0.0351, "avg_flight_time_mins": 100}
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
