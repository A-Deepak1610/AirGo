from fastapi.testclient import TestClient
from airgo.pipeline.db import init_db
from airgo.api.app import app

init_db()
client = TestClient(app)


def test_api_endpoints():
    # 1. Realtime Index
    res = client.get("/api/v1/index/realtime")
    assert res.status_code == 200
    data = res.json()
    assert "national_apix" in data
    assert "avg_fare" in data

    # 2. Sectors Summary
    res = client.get("/api/v1/sectors/summary")
    assert res.status_code == 200
    assert "sectors" in res.json()
    assert len(res.json()["sectors"]) > 0

    # 3. Elasticity Curve
    res = client.get("/api/v1/elasticity")
    assert res.status_code == 200
    assert "curve_points" in res.json()

    # 4. Backtest
    res = client.get("/api/v1/backtest")
    assert res.status_code == 200
    assert "mape_pct" in res.json()

    # 5. Dashboard HTML
    res = client.get("/")
    assert res.status_code == 200
    assert "AirGo" in res.text
