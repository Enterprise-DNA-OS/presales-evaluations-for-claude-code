# reopen

Preserve the previous decision in history, then reopen before changing evidence.

Example with synthetic records and dates to replace:

```bash
npm run presales -- reopen DEMO-101 --note="New evidence requires another review" --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
