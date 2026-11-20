# record-result

Read the actual evidence first. Use passed or failed and the actual observation date.

Example with synthetic records and dates to replace:

```bash
npm run presales -- record-result DEMO-101 "Recovery after outage" --status=passed --evidence="Reference to actual reviewed result" --date=2026-11-20 --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
