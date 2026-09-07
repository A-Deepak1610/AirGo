"""
Master Yatra airfare scraper orchestrator.
Executes multi-route and multi-horizon searches, manages Playwright browser pages,
handles anti-bot detections safely, extracts all flight and fare options,
saves screenshots and raw JSON to /runs/yatra/, and persists to PostgreSQL.
"""

import asyncio
from datetime import date, datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

from playwright.async_api import Page, Response

from airgo.scrapers.yatra.browser import BROWSER_MANAGER, PlaywrightBrowserManager
from airgo.scrapers.yatra.config import DEFAULT_YATRA_CONFIG, YatraScraperConfig
from airgo.scrapers.yatra.dates import SearchWindow, generate_search_windows
from airgo.scrapers.yatra.db_adapter import persist_fare_quotes_to_db
from airgo.scrapers.yatra.models import AntiBotEvent, NormalizedFareQuote
from airgo.scrapers.yatra.parser import YatraParser
from airgo.scrapers.yatra.routes import RouteDefinition, get_route, list_routes
from airgo.scrapers.yatra.run_manager import YatraRunManager
from airgo.scrapers.yatra.selectors import YatraSelectors

logger = logging.getLogger("AirGo.Yatra.Scraper")


class YatraScraper:
    """Master controller executing airfare collection across corridors and advance windows."""

    def __init__(
        self,
        config: Optional[YatraScraperConfig] = None,
        run_manager: Optional[YatraRunManager] = None,
        browser_manager: Optional[PlaywrightBrowserManager] = None,
    ):
        self.config = config or DEFAULT_YATRA_CONFIG
        self.run_manager = run_manager or YatraRunManager(base_runs_dir=self.config.runs_dir)
        self.browser_manager = browser_manager or BROWSER_MANAGER

    def build_search_url(
        self,
        origin_iata: str,
        dest_iata: str,
        travel_date: date,
        cabin_class: str = "Economy",
    ) -> str:
        """Constructs the canonical Yatra flight trigger URL."""
        params = {
            "type": "O",
            "viewName": "normal",
            "flexi": "0",
            "noOfSegments": "1",
            "origin": origin_iata.strip().upper(),
            "originCountry": "IN",
            "destination": dest_iata.strip().upper(),
            "destinationCountry": "IN",
            "flight_depart_date": travel_date.strftime("%d/%m/%Y"),
            "ADT": "1",
            "CHD": "0",
            "INF": "0",
            "class": cabin_class,
            "source": "fresco-home",
        }
        return f"https://flight.yatra.com/air-search-ui/dom2/trigger?{urlencode(params)}"

    async def search_route_window(
        self,
        page: Page,
        route: RouteDefinition,
        window: SearchWindow,
    ) -> Dict[str, Any]:
        """
        Executes a single route/window search: navigates, detects anti-bot challenges,
        captures screenshot proof, and parses all available flight cards.
        """
        search_url = self.build_search_url(
            origin_iata=route.origin_iata,
            dest_iata=route.dest_iata,
            travel_date=window.travel_date,
        )
        logger.info(f"Searching {route.route_code} | {window.window_code} ({window.iso_travel_date})")

        search_context = {
            "route": route.route_code,
            "origin": route.origin_iata,
            "destination": route.dest_iata,
            "search_date": window.search_date,
            "travel_date": window.travel_date,
            "advance_purchase_days": window.advance_purchase_days,
            "url": search_url,
        }

        response: Optional[Response] = None
        try:
            response = await page.goto(
                search_url,
                wait_until="domcontentloaded",
                timeout=self.config.browser_timeout_ms,
            )
        except Exception as e:
            logger.warning(f"Navigation error on {route.route_code} {window.window_code}: {e}")
            err_shot = self.run_manager.get_screenshot_path(
                route.route_code, window.window_code, "navigation_error"
            )
            try:
                await page.screenshot(path=str(err_shot), full_page=False)
            except Exception:
                pass
            return {
                "status": "error",
                "message": str(e),
                "raw_quotes": [],
                "normalized_quotes": [],
            }

        status_code = response.status if response else 200
        html = await page.content()

        # Check for Anti-Bot / Security Barriers (Without Evasion)
        challenge_event = YatraParser.detect_anti_bot(
            html=html,
            status_code=status_code,
            url=search_url,
            route=route.route_code,
            travel_date=window.travel_date,
        )

        if challenge_event:
            logger.warning(
                f"Security challenge detected on {route.route_code} {window.window_code}: {challenge_event.message}"
            )
            challenge_shot = self.run_manager.get_screenshot_path(
                route.route_code, window.window_code, "security_challenge"
            )
            try:
                await page.screenshot(path=str(challenge_shot), full_page=False)
                challenge_event.screenshot_path = str(challenge_shot)
            except Exception:
                pass

            self.run_manager.record_anti_bot_event(challenge_event)
            return {
                "status": "challenge",
                "challenge": challenge_event,
                "raw_quotes": [],
                "normalized_quotes": [],
            }

        # Wait for dynamic flight list rendering
        try:
            # Wait for any known flight card selector
            selector_query = ", ".join(YatraSelectors.FLIGHT_CARDS)
            await page.wait_for_selector(selector_query, timeout=15000)
        except Exception:
            logger.info(f"Wait timed out for flight cards on {route.route_code}; parsing rendered content.")

        # Capture search results screenshot proof
        results_shot = self.run_manager.get_screenshot_path(
            route.route_code, window.window_code, "search_results"
        )
        try:
            await page.screenshot(path=str(results_shot), full_page=False)
            logger.info(f"Saved search results screenshot: {results_shot}")
        except Exception as e:
            logger.warning(f"Failed to capture screenshot: {e}")

        # Parse rendered flight cards
        rendered_html = await page.content()
        raw_quotes, normalized_quotes = YatraParser.parse_flight_cards(
            rendered_html, search_context=search_context
        )

        return {
            "status": "success",
            "raw_quotes": raw_quotes,
            "normalized_quotes": normalized_quotes,
        }

    async def run_harvest(
        self,
        route_codes: Optional[List[str]] = None,
        horizons: Optional[List[int]] = None,
        persist_db: bool = True,
    ) -> Dict[str, Any]:
        """
        Master execution runner:
        Iterates over routes and horizons with controlled concurrency, rate delays,
        and backoff.
        """
        start_time = datetime.now(timezone.utc)
        logger.info(f"Starting Yatra Harvest Job [Run ID: {self.run_manager.run_id}]")

        # Select target corridors
        if route_codes:
            active_routes = [r for code in route_codes if (r := get_route(code))]
        else:
            active_routes = list_routes(active_only=True)

        windows = generate_search_windows(horizons=horizons)
        all_raw_quotes: List[Dict[str, Any]] = []
        all_normalized_quotes: List[NormalizedFareQuote] = []
        challenge_events: List[AntiBotEvent] = []
        failures: List[Dict[str, Any]] = []

        semaphore = asyncio.Semaphore(self.config.max_concurrency)

        async def _execute_single(route: RouteDefinition, window: SearchWindow):
            async with semaphore:
                # Polite inter-request delay
                await asyncio.sleep(self.config.request_delay)

                retries = 0
                while retries <= self.config.max_retries:
                    try:
                        async with self.browser_manager.new_page(
                            headless=self.config.headless
                        ) as page:
                            res = await self.search_route_window(page, route, window)

                        if res["status"] == "challenge":
                            challenge_events.append(res["challenge"])
                            # Back off gently without aggressive hammering
                            await asyncio.sleep(self.config.request_delay * self.config.backoff_factor)
                            break
                        elif res["status"] == "success":
                            all_raw_quotes.extend(res["raw_quotes"])
                            all_normalized_quotes.extend(res["normalized_quotes"])
                            break
                        else:
                            retries += 1
                            backoff = self.config.request_delay * (self.config.backoff_factor ** retries)
                            await asyncio.sleep(backoff)
                    except Exception as exc:
                        retries += 1
                        logger.warning(
                            f"Task failed ({route.route_code} {window.window_code}) attempt {retries}: {exc}"
                        )
                        if retries > self.config.max_retries:
                            failures.append({
                                "route": route.route_code,
                                "window": window.window_code,
                                "error": str(exc),
                            })
                        await asyncio.sleep(self.config.request_delay * self.config.backoff_factor)

        tasks = []
        for route in active_routes:
            for win in windows:
                tasks.append(_execute_single(route, win))

        await asyncio.gather(*tasks, return_exceptions=True)

        # Save artifacts locally in /runs/yatra/<timestamp>/data/
        raw_path = self.run_manager.save_raw_quotes(all_raw_quotes)
        norm_path = self.run_manager.save_normalized_quotes(all_normalized_quotes)

        # Persist to database if requested
        db_inserted = 0
        if persist_db and all_normalized_quotes:
            db_inserted = persist_fare_quotes_to_db(
                quotes=all_normalized_quotes,
                run_started_at=start_time,
            )

        end_time = datetime.now(timezone.utc)
        duration_seconds = round((end_time - start_time).total_seconds(), 2)

        summary = {
            "run_id": self.run_manager.run_id,
            "platform": "Yatra",
            "started_at": start_time.isoformat(),
            "completed_at": end_time.isoformat(),
            "duration_seconds": duration_seconds,
            "routes_count": len(active_routes),
            "windows_count": len(windows),
            "total_raw_quotes": len(all_raw_quotes),
            "total_normalized_quotes": len(all_normalized_quotes),
            "db_inserted_quotes": db_inserted,
            "challenges_encountered": len(challenge_events),
            "failures_count": len(failures),
            "failures": failures,
            "artifacts_directory": str(self.run_manager.run_dir),
        }

        self.run_manager.save_scraping_summary(summary)
        logger.info(
            f"Completed Yatra harvest: {len(all_normalized_quotes)} quotes captured in {duration_seconds}s "
            f"({db_inserted} persisted to DB)."
        )
        return summary


async def run_yatra_harvest(
    routes: Optional[List[str]] = None,
    horizons: Optional[List[int]] = None,
    headless: Optional[bool] = None,
) -> Dict[str, Any]:
    """Helper entrypoint to trigger Yatra harvest with custom filters."""
    cfg = YatraScraperConfig()
    if headless is not None:
        cfg.headless = headless
    scraper = YatraScraper(config=cfg)
    return await scraper.run_harvest(route_codes=routes, horizons=horizons)
