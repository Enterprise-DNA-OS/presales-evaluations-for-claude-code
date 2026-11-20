# resolve-gap

Inspect the resolution evidence. This does not automatically pass a criterion.

Example with synthetic records and dates to replace:

```bash
npm run presales -- resolve-gap DEMO-101 "Replay deduplication" --resolution="Reference to verified resolution" --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
