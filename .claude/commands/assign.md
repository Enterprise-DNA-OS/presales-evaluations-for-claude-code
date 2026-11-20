# assign

Assign the active evaluation to the named consultant.

Example with synthetic records and dates to replace:

```bash
npm run presales -- assign DEMO-101 --engineer="Operator name" --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
