# add-gap

Record the product gap without promising a release date.

Example with synthetic records and dates to replace:

```bash
npm run presales -- add-gap DEMO-101 --feature="Feature name" --owner="Product lead" --due=2026-12-15 --blocking=true --evidence="Observed gap reference" --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
