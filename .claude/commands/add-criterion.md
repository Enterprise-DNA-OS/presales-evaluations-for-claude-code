# add-criterion

Agree an observable acceptance criterion. Never mark it passed while adding it.

Example with synthetic records and dates to replace:

```bash
npm run presales -- add-criterion DEMO-101 --name="Recovery test" --expected="Resume without duplicates" --mandatory=true --actor="Operator name"
```

Read detail and history first. Replace example values with supplied facts. All record writes require an actor label, which is not authentication. Add `--json` for machine output. Ambiguous names list candidates and exit 1.
