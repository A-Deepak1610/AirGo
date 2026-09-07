-- =====================================================================
-- APIx Scraping Layer — PostgreSQL DDL (denormalized for query speed)
-- Scope: scraping/ingestion only
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. LEAN DIMENSION TABLES (kept only where they gate what CAN be scraped)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS dim_routes (
    route_id             SERIAL PRIMARY KEY,
    route_code           TEXT UNIQUE NOT NULL,     -- 'DEL-BOM'
    origin_iata          CHAR(3) NOT NULL,
    origin_city          TEXT NOT NULL,
    dest_iata            CHAR(3) NOT NULL,
    dest_city            TEXT NOT NULL,
    dgca_traffic_weight  NUMERIC(6,4) NOT NULL,    -- weight in the basket, from DGCA passenger data
    is_active            BOOLEAN DEFAULT TRUE,
    added_on             DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS dim_platforms (
    platform_id     SMALLSERIAL PRIMARY KEY,
    platform_name   TEXT UNIQUE NOT NULL,          -- 'IndiGo Direct','MakeMyTrip','Yatra', etc.
    platform_type   TEXT NOT NULL CHECK (platform_type IN ('airline_direct','ota')),
    base_url        TEXT NOT NULL,
    scrape_method   TEXT NOT NULL CHECK (scrape_method IN ('static_html','api_intercept','selenium','playwright','scrapy')),
    rate_limit_rpm  INT DEFAULT 10,
    tos_reviewed_on DATE,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dim_advance_purchase_windows (
    window_id       SMALLSERIAL PRIMARY KEY,
    window_code     TEXT UNIQUE NOT NULL,          -- 'T+1','T+7','T+15','T+30','T+45'
    days_ahead      SMALLINT NOT NULL,
    tolerance_days  SMALLINT DEFAULT 0
);

-- ---------------------------------------------------------------------
-- 2. SCRAPING INFRASTRUCTURE (rotation pools)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS proxy_pool (
    proxy_id        SERIAL PRIMARY KEY,
    ip_address      INET NOT NULL,
    provider        TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    last_used_at    TIMESTAMPTZ,
    failure_count   INT DEFAULT 0,
    blocked_until   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_agent_pool (
    ua_id           SERIAL PRIMARY KEY,
    user_agent      TEXT NOT NULL,
    device_type     TEXT CHECK (device_type IN ('desktop','mobile')),
    is_active       BOOLEAN DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- 3. JOB SCHEDULING — denormalized: carries platform/route names directly
--    so the scheduler and logs are readable without joining dims
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS scrape_jobs (
    job_id          BIGSERIAL PRIMARY KEY,
    route_id        INT NOT NULL REFERENCES dim_routes(route_id),
    route_code      TEXT NOT NULL,                 -- denormalized copy of dim_routes.route_code
    platform_id     SMALLINT NOT NULL REFERENCES dim_platforms(platform_id),
    platform_name   TEXT NOT NULL,                 -- denormalized copy of dim_platforms.platform_name
    window_id       SMALLINT NOT NULL REFERENCES dim_advance_purchase_windows(window_id),
    window_code     TEXT NOT NULL,                 -- denormalized copy, e.g. 'T+7'
    cron_expression TEXT NOT NULL,
    is_enabled      BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (route_id, platform_id, window_id)
);

-- ---------------------------------------------------------------------
-- 4. SCRAPE RUNS — execution log, partitioned monthly
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS scrape_runs (
    run_id              BIGSERIAL,
    job_id              BIGINT NOT NULL,
    route_code          TEXT NOT NULL,             -- denormalized, avoids join for dashboards
    platform_name       TEXT NOT NULL,             -- denormalized
    window_code         TEXT NOT NULL,             -- denormalized
    run_started_at      TIMESTAMPTZ NOT NULL,
    run_ended_at        TIMESTAMPTZ,
    status              TEXT NOT NULL CHECK (status IN ('success','partial','failed','captcha_blocked','rate_limited','timeout')),
    http_status_code    SMALLINT,
    proxy_id            INT REFERENCES proxy_pool(proxy_id),
    ua_id               INT REFERENCES user_agent_pool(ua_id),
    retry_count         SMALLINT DEFAULT 0,
    captcha_encountered BOOLEAN DEFAULT FALSE,
    records_scraped     SMALLINT DEFAULT 0,
    error_message       TEXT,
    scraper_version     TEXT,
    raw_log_path        TEXT,                      -- pointer to full log/HAR file in object storage
    PRIMARY KEY (run_id, run_started_at)
) PARTITION BY RANGE (run_started_at);

CREATE TABLE IF NOT EXISTS scrape_runs_2026_09 PARTITION OF scrape_runs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS scrape_runs_2026_10 PARTITION OF scrape_runs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS scrape_runs_default PARTITION OF scrape_runs DEFAULT;

-- ---------------------------------------------------------------------
-- 5. FARE QUOTES — single wide fact table, partitioned monthly.
--    Flight identity (airline, flight number, route, platform, window)
--    is stored directly on the row instead of behind a flight_instances
--    join — one table answers almost every dashboard/API query directly.
--    Overlap-across-platforms is a plain GROUP BY on this table (see
--    example query at the bottom), no separate view needed.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fare_quotes (
    quote_id              BIGSERIAL,
    run_id                BIGINT NOT NULL,
    run_started_at        TIMESTAMPTZ NOT NULL,     -- denormalized, joins into partitioned scrape_runs

    -- flight identity (denormalized, no flight_instances join needed)
    airline_code          CHAR(2) NOT NULL,         -- '6E','AI','I5','QP','SG'
    airline_name          TEXT NOT NULL,
    flight_number         TEXT NOT NULL,            -- '6E-2341'
    route_code            TEXT NOT NULL,             -- 'DEL-BOM'
    origin_iata           CHAR(3) NOT NULL,
    dest_iata             CHAR(3) NOT NULL,
    scheduled_dep_time     TIME NOT NULL,
    scheduled_arr_time     TIME,

    -- source
    platform_id            SMALLINT NOT NULL REFERENCES dim_platforms(platform_id),
    platform_name           TEXT NOT NULL,
    platform_type            TEXT NOT NULL CHECK (platform_type IN ('airline_direct','ota')),

    -- timing / window
    scrape_timestamp         TIMESTAMPTZ NOT NULL,
    travel_date               DATE NOT NULL,
    advance_purchase_days     SMALLINT NOT NULL,     -- actual days-ahead at scrape time
    window_code               TEXT NOT NULL,          -- 'T+1'..'T+45', bucketed from advance_purchase_days

    -- fare breakdown
    fare_class              TEXT,                     -- 'ECONOMY_SAVER','ECONOMY_FLEXI','SME', etc.
    base_fare                NUMERIC(10,2) NOT NULL,
    taxes                    NUMERIC(10,2) DEFAULT 0,
    user_dev_fee              NUMERIC(10,2) DEFAULT 0,
    convenience_fee            NUMERIC(10,2) DEFAULT 0,  -- OTA-specific; 0 for airline direct
    other_surcharges           NUMERIC(10,2) DEFAULT 0,
    total_fare                  NUMERIC(10,2) NOT NULL,   -- base + taxes + udf + convenience + other
    displayed_search_price      NUMERIC(10,2),            -- initial displayed price on search result page
    final_payable_price         NUMERIC(10,2),            -- verified price at pre-payment / pay now stage
    verification_status         TEXT DEFAULT 'SEARCH_RESULT',
    verification_timestamp      TIMESTAMPTZ,
    currency                  CHAR(3) DEFAULT 'INR',

    -- capacity
    total_seats               SMALLINT,               -- capacity as shown by this platform at scrape time
    seats_available             SMALLINT,               -- seats left as shown by this platform at scrape time
    load_factor_pct              NUMERIC(5,2) GENERATED ALWAYS AS (
                                    CASE WHEN total_seats > 0
                                         THEN ROUND(((total_seats - COALESCE(seats_available,0))::NUMERIC / total_seats) * 100, 2)
                                         ELSE NULL END
                                  ) STORED,

    availability_status         TEXT NOT NULL DEFAULT 'available'
                                 CHECK (availability_status IN ('available','sold_out','cancelled','not_found')),

    is_outlier                  BOOLEAN DEFAULT FALSE,
    dedup_hash                   TEXT NOT NULL,        -- hash(platform_id, flight_number, travel_date, scrape_ts rounded, fare_class)
    raw_payload                   JSONB,

    PRIMARY KEY (quote_id, scrape_timestamp)
) PARTITION BY RANGE (scrape_timestamp);

CREATE TABLE IF NOT EXISTS fare_quotes_2026_09 PARTITION OF fare_quotes
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS fare_quotes_2026_10 PARTITION OF fare_quotes
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS fare_quotes_default PARTITION OF fare_quotes DEFAULT;

-- Prevent double-counting from retried/overlapping scrapes
CREATE UNIQUE INDEX IF NOT EXISTS uq_fare_quotes_dedup
    ON fare_quotes (dedup_hash, scrape_timestamp);

-- Query indexes — sized around how the dashboard/API actually filters
CREATE INDEX IF NOT EXISTS idx_fare_quotes_route_platform_date
    ON fare_quotes (route_code, platform_id, travel_date);
CREATE INDEX IF NOT EXISTS idx_fare_quotes_flight_travel_date
    ON fare_quotes (airline_code, flight_number, travel_date);
CREATE INDEX IF NOT EXISTS idx_fare_quotes_window
    ON fare_quotes (window_code, travel_date);
CREATE INDEX IF NOT EXISTS idx_fare_quotes_scrape_ts_brin
    ON fare_quotes USING BRIN (scrape_timestamp);
CREATE INDEX IF NOT EXISTS idx_fare_quotes_raw_payload_gin
    ON fare_quotes USING GIN (raw_payload);
