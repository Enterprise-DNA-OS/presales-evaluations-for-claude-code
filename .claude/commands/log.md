# log

Log actual work using discovery, demo, poc, review or handover. Never forecast time as actual.

Example with synthetic records and dates to replace:

```bash
npm run presales -- log DEMO-101 --engineer="Operator name" --date=2026-11-20 --minutes=30 --kind=review --note="What actually happened" --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
