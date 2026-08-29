# AirGo - AI Agent Instructions

All agents operating in this workspace must adhere to:

1. **Zero Dummy Data**: Never invent or use placeholder variables, fake seat numbers, or mock prices. If data cannot be fetched, fail explicitly.
2. **Inspect Real DOM First**: Always inspect actual rendered HTML and DOM structures before writing selectors or parsing logic.
3. **Ground Truth Proof**: Generate visual screenshots and JSON artifacts to verify all extraction steps against live websites.
