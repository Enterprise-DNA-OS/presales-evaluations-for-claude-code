# Replace the Elvance evaluation desk

Elvance is native to Salesforce. Its [integration page](https://elvance.io/integrations/) describes scorecards and data tied to Salesforce records. Salesforce documents [exporting a report](https://help.salesforce.com/s/articleView?id=000206326&language=en_US&type=1) through Export, Details Only, CSV. The Export Reports permission is required. Choose UTF-8 or convert the file to UTF-8 before import.

## Export and map

Ask your Salesforce administrator for a flat evaluation or scorecard report with one row per evaluation, including a stable record ID, your evaluation code, account, opportunity name, assigned consultant, target date and optional technical stage. Report labels depend on your configuration. This project does not claim fixed Elvance managed-package API names or a universal vendor export layout.

Copy fixtures/elvance-map.json and replace each header with the exact real CSV header. The required destinations are source_id, code, account, name, engineer and due_date. source_stage is optional. Optional value and currency destinations accept a nonnegative decimal and a three-letter currency code together. Currency is never inferred. Normalise dates to YYYY-MM-DD in a working copy, keep the original separately, and verify counts and dates before loading. Use a stable --source label per Salesforce organisation because source IDs are namespaced by it.

```bash
npm run presales -- import elvance --file=imports/evaluations.csv --map=imports/map.json --source=my-salesforce-org --exported-at=2026-11-20T01:00:00Z --actor="Operator name" --dry-run
```

The single command validates every row without saving it. Remove --dry-run after checking the preview. Invalid dates, missing IDs, duplicate IDs, duplicate codes and collisions reject the whole batch. Reimporting identical mapped rows does nothing. A changed row is rejected for explicit reconciliation. It cannot overwrite operating decisions or silently delete records missing from an export. The database retains the imported CSV, mapping, source timestamp and every raw column.

## Reconcile before switching

Compare evaluation counts, stable IDs, names, assigned consultants and dates with the source report. Read detail and source-freshness. Imported technical stages remain source history only. Add and verify criteria, gaps and actual effort separately before recording a technical decision. Original extra columns are preserved but do not become structured criteria, activities, attachments or approval evidence automatically.

This importer covers evaluation summaries. Calendar synchronisation, call recordings, predictions, Salesforce permissions, files and related-object history do not migrate as working features. Keep those source exports separately and agree the mapping and connections Enterprise DNA should build. Do not cancel Elvance or Salesforce until the workflows and records your team depends on have been checked. The free desk does not replace the rest of Salesforce.
