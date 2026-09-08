/**
 * Index Methodology & Econometric Configuration Dataset.
 * Transparent mathematical specification of the Real-time Airfare Price Index (APIx).
 */

export const METHODOLOGY_CONFIG = {
  currentVersion: 'v1.2.0',
  effectiveDate: '2026-06-01',
  approvedBy: 'MoSPI National Accounts & DGCA Statistical Steering Committee',
  basePeriod: 'FY 2024-25 = 100.0',
  headlineFormula: 'Laspeyres Price Index with Jevons Elementary Aggregation',
  calculationFrequency: 'Real-time (every 15 minutes) + Daily Settlement (23:59 IST)',
  
  pipelineStages: [
    {
      step: 1,
      name: 'Data Collection & Verification',
      description: 'Headless browser automation captures ground-truth flight prices across 25 representative city-pairs at T+1, T+7, T+15, T+30, and T+45 days.',
      formula: 'Obs_{r, h, c, t} = \\text{Raw Observed Quote}',
      rules: ['Zero dummy data policy', 'Mandatory 4-step screenshot proof', 'Fail-fast on blocking']
    },
    {
      step: 2,
      name: 'Elementary Price Aggregation (Jevons)',
      description: 'Carrier quotes for each corridor and advance-purchase horizon are synthesized using unweighted geometric mean to eliminate volatility bias.',
      formula: 'P_{r, h, t} = \\left( \\prod_{i=1}^{N} p_{r, h, i, t} \\right)^{1/N}',
      rules: ['99th percentile winsorization', 'Geometric route imputation for canceled flights']
    },
    {
      step: 3,
      name: 'Lead-Time Horizon Weighting',
      description: 'Advance-purchase horizons are weighted by empirical booking volume shares derived from DGCA ticketing curves.',
      formula: 'P_{r, t} = \\sum_{h \\in H} w_h \\cdot P_{r, h, t}',
      rules: ['T+1: 18%', 'T+7: 24%', 'T+15: 32%', 'T+30: 16%', 'T+45: 10%']
    },
    {
      step: 4,
      name: 'National Route Basket Synthesis (Laspeyres)',
      description: 'The national headline index aggregates all 25 corridor price relatives weighted by passenger traffic volume within the basket.',
      formula: 'APIx_t = \\frac{\\sum_{r=1}^{M} W_r \\cdot P_{r, t}}{\\sum_{r=1}^{M} W_r \\cdot P_{r, 0}} \\times 100',
      rules: ['Weights normalized to \\sum W_r = 1.0', 'Base 2024=100.0']
    }
  ],

  parameters: [
    {
      id: 'PARAM-01',
      name: 'Index Formula Type',
      currentValue: 'Laspeyres (Fixed Base Weights)',
      options: ['Laspeyres (Base Weighted)', 'Paasche (Current Weighted)', 'Fisher Ideal (Geometric Average)', 'Törnqvist (Superlative)'],
      rationale: 'Laspeyres maintains operational stability and aligns directly with MoSPI CPI Transport Sub-Index guidelines.'
    },
    {
      id: 'PARAM-02',
      name: 'Elementary Aggregator',
      currentValue: 'Jevons (Geometric Mean)',
      options: ['Jevons (Geometric Mean)', 'Carli (Arithmetic Mean)', 'Dutot (Ratio of Averages)'],
      rationale: 'Satisfies time-reversal and transitivity statistical axioms without upward substitution bias.'
    },
    {
      id: 'PARAM-03',
      name: 'Outlier Treatment',
      currentValue: 'Winsorization at 99th Percentile',
      options: ['Winsorization (99th %tile)', 'Hard Trimming (Top/Bottom 1%)', 'No Filtering'],
      rationale: 'Prevents single-seat emergency medical or high-fare anomalies from distorting sector indexes.'
    },
    {
      id: 'PARAM-04',
      name: 'Missing Observation Imputation',
      currentValue: 'Geometric Corridor Carryover with Sector Drift',
      options: ['Geometric Carryover with Drift', 'Last Price Carried Forward', 'Exclusion from Period Basket'],
      rationale: 'Ensures uninterrupted index continuity even if an individual flight is temporarily unavailable.'
    },
    {
      id: 'PARAM-05',
      name: 'Tax & Fee Scope',
      currentValue: 'All-Inclusive Consumer Fare (Base + Fuel + UDF + PSF + GST)',
      options: ['All-Inclusive Consumer Fare', 'Base Fare Only', 'Base + Fuel Surcharge Only'],
      rationale: 'Measures the true economic price paid by travelers for inflation monitoring.'
    }
  ],

  advancePurchaseWeights: [
    { horizon: 'T+1', label: '1 Day Advance (Urgent / Business)', weightPct: 18.0, shareExplanation: 'High price elasticity, last-minute corporate travelers' },
    { horizon: 'T+7', label: '7 Days Advance (Short Lead)', weightPct: 24.0, shareExplanation: 'Standard weekly business and unplanned personal trips' },
    { horizon: 'T+15', label: '15 Days Advance (Fortnight)', weightPct: 32.0, shareExplanation: 'Highest volume domestic booking window across trunk sectors' },
    { horizon: 'T+30', label: '30 Days Advance (1 Month)', weightPct: 16.0, shareExplanation: 'Planned leisure and early booking incentives' },
    { horizon: 'T+45', label: '45 Days Advance (Long Lead)', weightPct: 10.0, shareExplanation: 'Peak holiday, seasonal, and low-fare promotional seats' }
  ],

  versionHistory: [
    {
      version: 'v1.2.0',
      date: '2026-06-01',
      author: 'Dr. Ananya Rao',
      changes: 'Added T+45 advance purchase window; switched elementary aggregator from Carli to Jevons.'
    },
    {
      version: 'v1.1.0',
      date: '2025-10-15',
      author: 'Rohan Sen',
      changes: 'Implemented 99th percentile winsorization for last-minute emergency fare spikes.'
    },
    {
      version: 'v1.0.0',
      date: '2024-04-01',
      author: 'MoSPI Technical Committee',
      changes: 'Initial baseline Laspeyres specification on 20 top trunk corridors.'
    }
  ]
};
