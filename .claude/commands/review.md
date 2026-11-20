# review

Use actual review dates and evidence. Retention dates are operator policy, not a statutory fixed period.

Example with synthetic records and dates to replace:

```bash
npm run presales -- review DEMO-101 --purpose="Evaluate connector requirements" --date=2026-11-20 --retention-review=2027-02-20 --note="Checked source and purpose" --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
