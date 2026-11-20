# decide

Use technical-win, technical-loss or paused. A win requires current review, required criteria all passed and no open blocking gaps. Never bypass a failed gate.

Example with synthetic records and dates to replace:

```bash
npm run presales -- decide DEMO-101 --status=technical-win --note="Reviewed acceptance evidence" --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
