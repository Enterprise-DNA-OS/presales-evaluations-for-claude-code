# export

Write a complete private JSON snapshot. It includes source CSV and audit records. Do not commit or publish it.

Example with synthetic records and dates to replace:

```bash
npm run presales -- export --out=exports/presales.json
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
