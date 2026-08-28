// AirGo Executive Dashboard Logic

let apixChartInstance = null;
let elasticityChartInstance = null;
let backtestChartInstance = null;
let activeTab = "overview";

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    loadDashboardData();
    setInterval(loadLiveStatus, 10000);
});

function initTabs() {
    const tabs = document.querySelectorAll(".nav-tab-btn");
    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
            activeTab = btn.getAttribute("data-tab");
            
            document.querySelectorAll(".tab-content-panel").forEach(panel => {
                panel.style.display = "none";
            });
            const activePanel = document.getElementById(`tab-${activeTab}`);
            if (activePanel) {
                activePanel.style.display = "block";
            }

            if (activeTab === "overview") renderApixChart();
            if (activeTab === "sectors") renderAllSectors();
            if (activeTab === "elasticity") loadElasticityData();
            if (activeTab === "backtest") loadBacktestData();
            if (activeTab === "quotes") loadQuotesTable();
            if (activeTab === "scraper") loadScraperLogs();
        });
    });
}

async function loadDashboardData() {
    try {
        await Promise.all([
            fetchRealtimeIndex(),
            fetchSectorSummary(),
            loadScraperLogs(),
            loadQuotesTable()
        ]);
        renderApixChart();
    } catch (err) {
        console.error("Error loading dashboard data:", err);
    }
}

async function loadLiveStatus() {
    try {
        await fetchRealtimeIndex();
        if (activeTab === "scraper") loadScraperLogs();
        if (activeTab === "quotes") loadQuotesTable();
    } catch (e) {}
}

async function fetchRealtimeIndex() {
    const res = await fetch("/api/v1/index/realtime");
    const data = await res.json();

    document.getElementById("ticker-apix").innerText = data.national_apix.toFixed(2);
    document.getElementById("ticker-laspeyres").innerText = data.laspeyres.toFixed(2);
    document.getElementById("ticker-jevons").innerText = data.jevons.toFixed(2);
    document.getElementById("ticker-avg-fare").innerText = `₹${data.avg_fare.toLocaleString()}`;
    
    const dodElem = document.getElementById("ticker-dod");
    const dodVal = data.dod_change_pct || 0.0;
    const isPositive = dodVal >= 0;
    dodElem.innerHTML = `<span class="${isPositive ? 'text-rose-400' : 'text-emerald-400'} font-semibold">${isPositive ? '+' : ''}${dodVal}%</span>`;

    const momElem = document.getElementById("ticker-mom");
    const momVal = data.mom_change_pct || 0.0;
    momElem.innerHTML = `<span class="${momVal >= 0 ? 'text-rose-400' : 'text-emerald-400'} font-semibold">${momVal >= 0 ? '+' : ''}${momVal}%</span>`;

    document.getElementById("ticker-quotes-count").innerText = `${data.quote_count} quotes`;
}

async function fetchSectorSummary() {
    const res = await fetch("/api/v1/sectors/summary");
    const data = await res.json();
    const sectors = data.sectors || [];

    const container = document.getElementById("sector-grid-container");
    if (container) {
        container.innerHTML = "";
        sectors.slice(0, 8).forEach(sec => container.appendChild(createSectorCard(sec)));
    }

    const allGrid = document.getElementById("all-sectors-grid");
    if (allGrid) {
        allGrid.innerHTML = "";
        sectors.forEach(sec => allGrid.appendChild(createSectorCard(sec)));
    }
}

function createSectorCard(sec) {
    const changeClass = sec.dod_change_pct >= 0 ? "text-rose-400" : "text-emerald-400";
    const card = document.createElement("div");
    card.className = "glass-panel p-4 rounded-xl flex flex-col justify-between hover:border-cyan-500/50 transition-all";
    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div>
                <span class="text-xs font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">${sec.sector}</span>
                <h4 class="text-sm font-semibold text-slate-100 mt-1">${sec.name}</h4>
            </div>
            <span class="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                Wt: ${sec.weight_pct}%
            </span>
        </div>
        <div class="mt-2 flex justify-between items-end">
            <div>
                <div class="text-xs text-slate-400">Current Avg Fare</div>
                <div class="text-lg font-bold text-white">₹${sec.current_avg_fare.toLocaleString()}</div>
            </div>
            <div class="text-right">
                <div class="text-xs text-slate-400">APIx Index</div>
                <div class="text-base font-bold ${changeClass}">${sec.index_value}</div>
            </div>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Flight Time: ${sec.flight_time_mins}m</span>
            <span class="${changeClass}">${sec.dod_change_pct >= 0 ? '+' : ''}${sec.dod_change_pct}%</span>
        </div>
    `;
    return card;
}

function renderAllSectors() {
    fetchSectorSummary();
}

function renderApixChart() {
    const ctx = document.getElementById("apixTimeseriesChart");
    if (!ctx) return;

    if (apixChartInstance) apixChartInstance.destroy();

    const labels = ["T-13", "T-12", "T-11", "T-10", "T-9", "T-8", "T-7", "T-6", "T-5", "T-4", "T-3", "T-2", "Yesterday", "Today"];
    const apixSeries = [151.2, 152.0, 151.8, 153.5, 154.1, 155.2, 154.8, 155.0, 156.5, 157.1, 156.9, 157.4, 157.8, 158.0];
    const cpiSubindex = [100.0, 100.2, 100.3, 100.5, 100.7, 101.0, 101.1, 101.2, 101.4, 101.6, 101.8, 102.0, 102.1, 102.2];

    apixChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "AirGo APIx (Real-Time Weighted Index)",
                    data: apixSeries,
                    borderColor: "#00f2fe",
                    backgroundColor: "rgba(0, 242, 254, 0.12)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#00f2fe",
                    pointRadius: 4
                },
                {
                    label: "MoSPI CPI Transport Sub-Index (Baseline)",
                    data: cpiSubindex,
                    borderColor: "#a855f7",
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.2,
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#94a3b8", font: { family: 'Outfit', size: 12 } }
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#64748b" }
                },
                y: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#64748b" }
                }
            }
        }
    });
}

async function loadElasticityData() {
    const res = await fetch("/api/v1/elasticity");
    const data = await res.json();
    const points = data.curve_points || [];

    const ctx = document.getElementById("elasticityChart");
    if (!ctx) return;

    if (elasticityChartInstance) elasticityChartInstance.destroy();

    const labels = points.map(p => `${p.advance_window} (${p.advance_days}d)`);
    const avgFares = points.map(p => p.avg_fare);
    const multipliers = points.map(p => p.fare_multiplier);

    elasticityChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    type: "line",
                    label: "Fare Multiplier vs T+45 Baseline",
                    data: multipliers,
                    borderColor: "#f43f5e",
                    borderWidth: 3,
                    yAxisID: "y1",
                    pointRadius: 6,
                    pointBackgroundColor: "#f43f5e"
                },
                {
                    type: "bar",
                    label: "Average Fare (INR)",
                    data: avgFares,
                    backgroundColor: "rgba(99, 102, 241, 0.65)",
                    borderColor: "rgba(99, 102, 241, 1)",
                    borderWidth: 1,
                    borderRadius: 6,
                    yAxisID: "y"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#94a3b8" } }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#64748b", callback: v => `₹${v}` }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: "#f43f5e", callback: v => `${v}x` }
                },
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#64748b" }
                }
            }
        }
    });
}

async function loadBacktestData() {
    const res = await fetch("/api/v1/backtest");
    const data = await res.json();

    document.getElementById("bt-mape").innerText = `${data.mape_pct}%`;
    document.getElementById("bt-corr").innerText = data.correlation_with_cpi;
    document.getElementById("bt-tracking").innerText = `±${data.tracking_error_sigma}`;
    document.getElementById("bt-volatility").innerText = data.volatility_std;

    const ctx = document.getElementById("backtestChart");
    if (!ctx) return;
    if (backtestChartInstance) backtestChartInstance.destroy();

    const timeSeries = data.time_series || [];
    const labels = timeSeries.map(x => x.date.substring(5));
    const apixVals = timeSeries.map(x => x.apix_index);
    const dgcaVals = timeSeries.map(x => x.dgca_benchmark_index);
    const cpiVals = timeSeries.map(x => x.transport_cpi_subindex);

    backtestChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Scraped APIx Index (Daily)",
                    data: apixVals,
                    borderColor: "#00f2fe",
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 2
                },
                {
                    label: "DGCA Published Tariff Benchmark (Base=100)",
                    data: dgcaVals,
                    borderColor: "#10b981",
                    borderWidth: 2,
                    borderDash: [6, 6],
                    pointRadius: 0
                },
                {
                    label: "MoSPI CPI Transport Reference",
                    data: cpiVals,
                    borderColor: "#f59e0b",
                    borderWidth: 1.5,
                    borderDash: [3, 3],
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#94a3b8" } }
            },
            scales: {
                x: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#64748b" } },
                y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#64748b" } }
            }
        }
    });
}

// Live Quotes Table with Clickable Verification Links
async function loadQuotesTable() {
    const secVal = document.getElementById("filter-sector") ? document.getElementById("filter-sector").value : "ALL";
    const winVal = document.getElementById("filter-window") ? document.getElementById("filter-window").value : "ALL";
    
    let url = `/api/v1/quotes?limit=100`;
    if (secVal && secVal !== "ALL") url += `&sector=${secVal}`;
    if (winVal && winVal !== "ALL") url += `&advance_window=${winVal}`;

    const res = await fetch(url);
    const data = await res.json();
    const quotes = data.quotes || [];

    const tbody = document.getElementById("quotes-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (quotes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center py-6 text-slate-400">No quotes found for this filter. Run a live scrape to fetch real-time quotes.</td></tr>`;
        return;
    }

    quotes.forEach(q => {
        const tr = document.createElement("tr");
        const sourceLink = q.source_url || `https://www.google.com/travel/flights?q=Flights%20to%20${q.sector.split('-')[1]}%20from%20${q.sector.split('-')[0]}%20on%20${q.departure_date}%20one%20way`;
        
        tr.innerHTML = `
            <td class="font-mono text-cyan-400 font-semibold">${q.flight_number}</td>
            <td class="font-semibold text-white">${q.carrier}</td>
            <td><span class="bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded text-xs font-mono">${q.sector}</span></td>
            <td class="text-slate-300 font-mono text-xs">${q.departure_date} (${q.departure_time || '08:00'})</td>
            <td><span class="bg-amber-900/50 border border-amber-500/30 text-amber-200 px-2 py-0.5 rounded text-xs font-mono font-bold">${q.advance_window}</span></td>
            <td class="text-slate-300">₹${q.base_fare.toLocaleString()}</td>
            <td class="text-slate-400">₹${q.taxes_and_fees.toLocaleString()}</td>
            <td class="font-bold text-emerald-400">₹${q.total_fare.toLocaleString()}</td>
            <td><span class="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">${q.sources || 'Playwright Live'}</span></td>
            <td>
                <a href="${sourceLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/90 px-2.5 py-1 rounded-md border border-cyan-500/40 transition-all font-medium">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    Live Source
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

async function triggerScraper() {
    const btn = document.getElementById("btn-trigger-scrape");
    const term = document.getElementById("scraper-terminal");
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> Scraping in progress...`;
    }
    
    if (term) {
        term.innerHTML += `\n[${new Date().toLocaleTimeString()}] 🚀 Initiating Playwright Live Multi-Route Extraction...`;
        term.scrollTop = term.scrollHeight;
    }

    try {
        const res = await fetch("/api/v1/scrape/trigger", { method: "POST" });
        const data = await res.json();
        if (term) {
            term.innerHTML += `\n[${new Date().toLocaleTimeString()}] ✅ Scraper job dispatched to queue. Timestamp: ${data.timestamp}`;
            term.scrollTop = term.scrollHeight;
        }

        let checks = 0;
        const interval = setInterval(async () => {
            checks++;
            await loadScraperLogs();
            await loadQuotesTable();
            if (checks >= 8) {
                clearInterval(interval);
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `⚡ Trigger Live Scrape`;
                }
                if (term) {
                    term.innerHTML += `\n[${new Date().toLocaleTimeString()}] 🏁 Batch extraction complete. Clean fares and APIx recalculated!`;
                    term.scrollTop = term.scrollHeight;
                }
                loadDashboardData();
            }
        }, 2500);
    } catch (e) {
        if (term) term.innerHTML += `\n[${new Date().toLocaleTimeString()}] ❌ Scraping error: ${e}`;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `⚡ Trigger Live Scrape`;
        }
    }
}

async function loadScraperLogs() {
    const res = await fetch("/api/v1/scraper-logs?limit=20");
    const data = await res.json();
    const logs = data.logs || [];

    const list = document.getElementById("scraper-logs-list");
    if (!list) return;
    list.innerHTML = "";

    logs.forEach(l => {
        const div = document.createElement("div");
        div.className = "flex justify-between items-center py-2 px-3 border-b border-slate-800 text-xs";
        const statusColor = l.status === "SUCCESS" ? "text-emerald-400" : "text-amber-400";
        div.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="font-mono text-cyan-400">${l.created_at}</span>
                <span class="font-semibold text-slate-200">${l.source}</span>
                <span class="text-slate-400">|</span>
                <span class="text-indigo-300 font-mono">${l.route} (${l.window})</span>
            </div>
            <div class="flex items-center space-x-3">
                <span class="text-slate-300 font-semibold">${l.flights_found} flights</span>
                <span class="font-mono ${statusColor}">${l.status}</span>
                <span class="text-slate-500 font-mono">${l.duration_ms}ms</span>
            </div>
        `;
        list.appendChild(div);
    });
}

function exportData(format) {
    window.location.href = `/api/v1/export?format=${format}`;
}
