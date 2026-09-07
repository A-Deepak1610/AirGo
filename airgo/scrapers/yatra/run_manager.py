"""
Run storage and artifact manager for Yatra scraper executions.
Ensures every execution writes into an isolated, timestamped folder under /runs/yatra/
and preserves raw quotes, normalized JSON, screenshot proofs, and logs.
"""

from datetime import datetime, timezone
import json
import logging
import os
from pathlib import Path
import re
from typing import Any, Dict, List, Optional

from airgo.config import RUNS_DIR
from airgo.scrapers.yatra.models import AntiBotEvent, NormalizedFareQuote

logger = logging.getLogger("AirGo.Yatra.RunManager")


class YatraRunManager:
    """Manages creation, layout, and artifact saving for a single Yatra scraping execution."""

    def __init__(
        self,
        base_runs_dir: Optional[Path] = None,
        run_timestamp: Optional[str] = None,
    ):
        base_dir = base_runs_dir or RUNS_DIR
        ts = run_timestamp or datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
        self.run_id = f"yatra_{ts}"
        self.run_dir = base_dir / "yatra" / ts

        # Subdirectories
        self.data_dir = self.run_dir / "data"
        self.screenshots_dir = self.run_dir / "screenshots"
        self.logs_dir = self.run_dir / "logs"

        # Initialize folders
        self._initialize_directories()

    def _initialize_directories(self) -> None:
        """Creates the run directory and required subdirectories."""
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Initialized Yatra run directory: {self.run_dir}")

    @staticmethod
    def _sanitize_filename(name: str) -> str:
        """Removes or replaces invalid characters for safe cross-platform filenames."""
        cleaned = re.sub(r"[^\w\-_.]", "_", name.strip())
        return cleaned

    def get_screenshot_path(
        self,
        route_code: str,
        window_code: str,
        label: str,
        ext: str = ".png",
    ) -> Path:
        """
        Computes and creates target path for a screenshot within route and window folder.
        Example: runs/yatra/<ts>/screenshots/DEL-BOM/T+1/DEL-BOM_T+1_search_results.png
        """
        route_dir = self.screenshots_dir / self._sanitize_filename(route_code)
        window_dir = route_dir / self._sanitize_filename(window_code)
        window_dir.mkdir(parents=True, exist_ok=True)

        clean_label = self._sanitize_filename(label)
        if not clean_label.endswith(ext):
            clean_label += ext

        filename = f"{self._sanitize_filename(route_code)}_{self._sanitize_filename(window_code)}_{clean_label}"
        return window_dir / filename

    def save_raw_quotes(self, raw_quotes: List[Dict[str, Any]]) -> Path:
        """Saves raw scraped airfare observations to data/raw_quotes.json."""
        out_path = self.data_dir / "raw_quotes.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(raw_quotes, f, indent=2, default=str)
        logger.info(f"Saved {len(raw_quotes)} raw quotes to {out_path}")
        return out_path

    def save_normalized_quotes(self, normalized_quotes: List[NormalizedFareQuote]) -> Path:
        """Saves validated normalized quotes to data/normalized_quotes.json."""
        out_path = self.data_dir / "normalized_quotes.json"
        serialized = [q.model_dump(mode="json") for q in normalized_quotes]
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(serialized, f, indent=2, default=str)
        logger.info(f"Saved {len(normalized_quotes)} normalized quotes to {out_path}")
        return out_path

    def save_scraping_summary(self, summary: Dict[str, Any]) -> Path:
        """Saves overall execution statistics and metrics to data/scraping_summary.json."""
        out_path = self.data_dir / "scraping_summary.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, default=str)
        logger.info(f"Saved scraping summary to {out_path}")
        return out_path

    def record_anti_bot_event(self, event: AntiBotEvent) -> Path:
        """Appends an anti-bot challenge event to data/antibot_events.json."""
        out_path = self.data_dir / "antibot_events.json"
        existing = []
        if out_path.exists():
            try:
                with open(out_path, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = []

        existing.append(event.model_dump(mode="json"))
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2, default=str)
        logger.warning(f"Recorded anti-bot event to {out_path}: {event.event_type}")
        return out_path
