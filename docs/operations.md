# Operation

Use a trusted operator account on a controlled workstation or server. Actor labels record what the operator supplied, not who authenticated. RLS is enabled and public grants revoked on domain tables. The database owner bypasses RLS and controls views. Do not expose owner credentials or database views through a public API. Configure least-privilege roles, backups, access review and retention for a shared deployment.

Use one PGlite process at a time. PostgreSQL supports multiple sessions; the CLI serialises mutations with a database lock so a technical decision cannot race a result change. Each mutation and its audit record commit together. Database owner edits can bypass CLI checks and audit logging. The log is application history, not tamper-proof evidence.

Use YYYY-MM-DD for calendar dates, and explicit timezone offsets for export timestamps. Future activity and evidence dates are rejected. Actual effort covers today and the preceding six calendar days in UTC. It is not capacity planning. Revenue review groups entered values by currency, never converts them and never treats an unproven amount as an expected loss. Technical outcome counts are not commercial win rates. Retention review dates and the 14-day accuracy threshold are operator policies. Due dates never silently change a status.

npm run presales -- export --out=exports/backup.json writes all domain records including source CSV, mappings and audit. It is a portable snapshot, not an automated restore tool. For production use a database backup and test restoration in a separate instance. Preserve evidence files referenced by text separately. Evidence strings are references, not attached files or proof of the underlying contents.

Reports and drafts contain private records and are ignored by git. They are written with restrictive permissions on systems supporting POSIX modes. Windows operators must set folder ACLs. Decide retention for database records, backups, exports and reports together. The free base does not auto-delete them.
