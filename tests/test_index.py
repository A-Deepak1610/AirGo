from datetime import date
from airgo.engine.index_calculator import IndexCalculator
from airgo.engine.elasticity import ElasticityAnalyzer
from airgo.engine.backtest import BacktestEngine
from airgo.pipeline.db import init_db


def test_index_calculator_and_elasticity():
    init_db()
    today = date.today()
    calc = IndexCalculator()
    idx_res = calc.compute_daily_index(today)
    assert idx_res is not None

    elasticity = ElasticityAnalyzer()
    curve = elasticity.compute_lead_time_curve()
    assert len(curve) == 5
    assert curve[0].advance_window == "T+1"
    assert curve[-1].advance_window == "T+45"
    assert curve[0].avg_fare > 0
    assert curve[-1].avg_fare > 0


def test_backtest_engine():
    bt = BacktestEngine()
    results = bt.run_30_day_backtest()
    assert results["status"] == "VALIDATED"
    assert results["backtest_period_days"] == 30
    assert "mape_pct" in results
    assert "correlation_with_cpi" in results
