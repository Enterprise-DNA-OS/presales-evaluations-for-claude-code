# Presales Evaluations for Claude Code

A technical win needs evidence. Keep evaluations, acceptance criteria, product gaps, consultant effort and decision history in a database you own.

## Three ways to use it

- **Do it yourself:** free MIT source. Operate your own evidence desk with Claude Code, Codex, OpenCode or Cursor.
- **We customise it:** Enterprise DNA maps your Elvance records and builds your rules, reports, connections and web front end where needed. One setup fee, then a retainer.
- **We run it for you:** installed, connected and maintained through **Omni by Enterprise DNA**. One setup fee, then a retainer. [Talk to Sam](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=elvance&utm_medium=readme).

## Quick start

Node 20 or newer. Windows and Linux use the same scripts. Embedded PGlite needs no server. Set DATABASE_URL to use PostgreSQL.

```bash
npm install
npm run demo
npm run presales -- attention
npm run presales -- deal-review
npm run presales -- weekly-review
npm run view
npm run docs
npm test
```

The idempotent seed creates three fictional evaluations, deliberately stale reviews, failed proof and overdue gaps. It leaves an existing evaluation database alone. Run it only in an empty disposable database.

## The presales week

/deal-review prepares the technical forecast discussion. /proof-plan checks acceptance evidence. /product-gaps gives the product lead named blockers. /effort-review shows recorded consultant time. /weekly-review combines the first review with attention, effort and record checks. These are records and transparent rules, not predicted win probabilities.

Record an evaluation, add agreed mandatory criteria, record actual results and gaps, log effort and review the records. /decide refuses a technical win until mandatory criteria exist and all pass, blocking gaps are resolved and the privacy review is current. A technical win is an internal judgement, not a customer signature. Reopen before changing evidence on a decided evaluation.

## Bring your Elvance history

```bash
npm run presales -- import elvance --file=fixtures/elvance.csv --map=fixtures/elvance-map.json --source=synthetic-demo --exported-at=2026-11-19T12:00:00Z --actor="Operator name" --dry-run
```

The fixture is a synthetic mapping example, not a vendor specimen. Elvance holds records inside Salesforce. Export a details-only CSV report, inspect its real headers, map selected evaluation columns and preview. Repeat without --dry-run after reconciling. Original CSV and every column are preserved. Reimporting an unchanged row is a no-op. Changed source rows are rejected for explicit reconciliation, never allowed to overwrite local evidence. Source technical stages do not approve a win here. [Switch guide](docs/replace-elvance.md).

## Ten questions you can answer from your own records

1. Which evaluations need a decision before the next review? `attention`
2. Which required claims still lack passing evidence? `proof-plan`
3. Which product gaps block a technical win? `product-gaps`
4. Where did consultants spend their time in the last seven days? `effort-review`
5. Which evaluations are overdue and still blocked? `attention`
6. Who recorded the decision and why? `history`
7. Which source stages have not been verified here? `detail`
8. Which records need a retention review? `compliance`
9. How much effort has gone into an evaluation with missing proof? `deal-review`
10. When were our source exports produced? `source-freshness`

These are implemented questions, not a claim that Elvance cannot answer them. Elvance itself documents dashboards and conversational access. The difference here is control over the records, evidence rules and reporting without a subscription to this code.

## Commands

- /revenue-review: Review entered opportunity values by currency. Unproven value is not a forecast or expected loss. Unknown values stay unknown.
- /win-review: Count recorded technical outcomes by consultant. These are not commercial wins or predicted probabilities.
- /evaluations: List the evaluations and their owners.
- /deal-review: Review required evidence, blockers and effort together.
- /attention: Show overdue evaluations, stale reviews and missing proof.
- /proof-plan: Read the agreed criteria, expected results and recorded evidence.
- /product-gaps: Review open product gaps with owners and dates.
- /effort-review: Review effort recorded over the last seven calendar days. This is not scheduled capacity.
- /compliance: Read evidence and privacy review flags. Explain that these checks do not certify compliance.
- /source-freshness: Show the dates of imported source exports. No rows means no source evidence.
- /imports: List imported batches and who recorded them.
- /audit: Read the full change history.
- /help: List supported CLI commands.
- /weekly-review: Read attention, deal-review, effort-review, compliance and source-freshness. Write a Monday review with decisions and named owners from these records.
- /detail: Read the full evaluation before advising or changing it.
- /history: Read every recorded change and the actor label.
- /add: Confirm the supplied account, scope, owner and date. No invented records.
- /assign: Assign the active evaluation to the named consultant.
- /plan: Record the date agreed by the operator.
- /review: Use actual review dates and evidence. Retention dates are operator policy, not a statutory fixed period.
- /add-criterion: Agree an observable acceptance criterion. Never mark it passed while adding it.
- /record-result: Read the actual evidence first. Use passed or failed and the actual observation date.
- /add-gap: Record the product gap without promising a release date.
- /resolve-gap: Inspect the resolution evidence. This does not automatically pass a criterion.
- /log: Log actual work using discovery, demo, poc, review or handover. Never forecast time as actual.
- /decide: Use technical-win, technical-loss or paused. A win requires current review, required criteria all passed and no open blocking gaps. Never bypass a failed gate.
- /reopen: Preserve the previous decision in history, then reopen before changing evidence.
- /draft-handover: Create an internal draft in drafts. Review evidence and personal information before anyone shares it. Never send.
- /import: Read docs/replace-elvance.md. Inspect real headers, map and preview. Remove --dry-run only for an authorised import. Source stages never count as verified technical decisions.
- /export: Write a complete private JSON snapshot. It includes source CSV and audit records. Do not commit or publish it.
- /customise: See the matching recipe.
- /new-view: See the matching recipe.
- /docs: See the matching recipe.
- /view: See the matching recipe.

All CLI commands accept --json. Writes require --actor. Exact code or case-insensitive name wins before partial matching. Ambiguous matches list candidates and exit 1. Use help for the list and .claude/commands for complete examples.

## Paperwork and views

Set business name, colours and logo in brand.json. npm run docs produces an evaluation brief and technical decision record for each evaluation. npm run view produces the weekly review as read-only HTML. Print from a browser if a PDF is needed. /draft-handover writes a private internal draft, never sends it.

## Your first hour: ten things to ask for

1. Put our name on the evaluation brief.
2. Show the overdue proof of concept.
3. Explain why its technical win is blocked.
4. Find the product gap owner.
5. Compare consultant effort over the last week.
6. Preview an exported Elvance report.
7. Record a real acceptance criterion.
8. Review the record retention dates.
9. Add our deployment region with /customise.
10. Add a product-specific evidence view with /new-view.

## Scope

The free base is a manually operated presales evidence desk. It does not predict wins, record calls, synchronise calendars, host buyer access, authenticate users or run a product demonstration environment. Enterprise DNA scopes those connections and interfaces in the customised version. Salesforce remains in place if you still use it for CRM. [Why no front end](docs/why-no-front-end.md).

[Compliance](docs/compliance.md), [operation](docs/operations.md), [research](docs/research.md). MIT. Not affiliated with Elvance, Salesforce or Anthropic. Hosting, agent subscriptions and operation remain your costs.
