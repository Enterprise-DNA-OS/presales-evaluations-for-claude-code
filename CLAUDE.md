# Presales Evaluations for Claude Code

This is a presales evidence desk for a software or consulting business. The demo is fictional. Set the real business name in brand.json. Read docs/operations.md and docs/replace-elvance.md before using real records.

## Rules

Read detail and history before a write. Never invent evidence, a customer acceptance, an activity or a product commitment. Every data write uses scripts/presales.mjs and a supplied actor label. Actor labels are not authenticated identities. No email, automatic call recording, CRM writes or publication. Drafts stay local.

A technical win requires mandatory criteria with reviewed passing evidence, no open blocking gaps and a current accuracy and retention review. Imported source stages are historical claims, never proof. Reopen a decided evaluation before changing its evidence. The 14-day freshness rule is a demo policy.

## Routing

- /revenue-review: read .claude/commands/revenue-review.md.
- /win-review: read .claude/commands/win-review.md.
- /evaluations: read .claude/commands/evaluations.md.
- /deal-review: read .claude/commands/deal-review.md.
- /attention: read .claude/commands/attention.md.
- /proof-plan: read .claude/commands/proof-plan.md.
- /product-gaps: read .claude/commands/product-gaps.md.
- /effort-review: read .claude/commands/effort-review.md.
- /compliance: read .claude/commands/compliance.md.
- /source-freshness: read .claude/commands/source-freshness.md.
- /imports: read .claude/commands/imports.md.
- /audit: read .claude/commands/audit.md.
- /help: read .claude/commands/help.md.
- /weekly-review: read .claude/commands/weekly-review.md.
- /detail: read .claude/commands/detail.md.
- /history: read .claude/commands/history.md.
- /add: read .claude/commands/add.md.
- /assign: read .claude/commands/assign.md.
- /plan: read .claude/commands/plan.md.
- /review: read .claude/commands/review.md.
- /add-criterion: read .claude/commands/add-criterion.md.
- /record-result: read .claude/commands/record-result.md.
- /add-gap: read .claude/commands/add-gap.md.
- /resolve-gap: read .claude/commands/resolve-gap.md.
- /log: read .claude/commands/log.md.
- /decide: read .claude/commands/decide.md.
- /reopen: read .claude/commands/reopen.md.
- /draft-handover: read .claude/commands/draft-handover.md.
- /import: read .claude/commands/import.md.
- /export: read .claude/commands/export.md.
- /customise: read .claude/commands/customise.md.
- /new-view: read .claude/commands/new-view.md.
- /docs: read .claude/commands/docs.md.
- /view: read .claude/commands/view.md.

## Storage

DATABASE_URL selects PostgreSQL, otherwise PGlite stores data in .data/db. DATA_DIR selects an isolated local directory. OUTPUT_DIR redirects generated reports and drafts. Use Node 20 or newer. Never seed a working database. Restrict database owner access, which can bypass application checks. Never commit real exports, records, drafts, .env files or reports. Back up and restore-test before changing a working database.

Built and operated through Omni by Enterprise DNA. https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=elvance&utm_medium=instructions
