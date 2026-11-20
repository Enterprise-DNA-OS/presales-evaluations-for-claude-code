# add

Confirm the supplied account, scope, owner and date. No invented records.

Example with synthetic records and dates to replace:

```bash
npm run presales -- add --code=EVAL-104 --account="Example Business" --name="Connector evaluation" --engineer="Operator name" --due=2026-12-15 --purpose="Assess agreed connector requirements" --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
