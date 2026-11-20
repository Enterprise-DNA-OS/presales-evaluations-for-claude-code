# import

Read docs/replace-elvance.md. Inspect real headers, map and preview. Remove --dry-run only for an authorised import. Source stages never count as verified technical decisions.

Example with synthetic records and dates to replace:

```bash
npm run presales -- import elvance --file=fixtures/elvance.csv --map=fixtures/elvance-map.json --source=synthetic-demo --exported-at=2026-11-19T12:00:00Z --actor="Operator name" --dry-run
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
