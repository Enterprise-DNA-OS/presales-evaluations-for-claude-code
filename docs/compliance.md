# Evidence and privacy checks

Reviewed 2026-11-20. These checks flag records for operator action. They do not certify legal compliance or replace a business privacy assessment. The base defaults to New Zealand guidance. An Australian deployment needs its own applicable rules and retention policy.

| Check | Implemented behaviour | Source |
|---|---|---|
| NZ-IPP1 | Flag an empty stated purpose for the evaluation record | [NZ Privacy Commissioner, principle 1](https://www.privacy.org.nz/privacy-principles/1/) |
| NZ-IPP8 | Flag an absent accuracy review or a review over 14 days old | [NZ Privacy Commissioner, principle 8](https://www.privacy.org.nz/privacy-principles/8/) |
| NZ-IPP9 | Flag missing or due retention review dates | [NZ Privacy Commissioner, principle 9](https://www.privacy.org.nz/privacy-principles/9/) |
| EVIDENCE-1 | Flag a technical win without required passing criteria or with blocking gaps | Internal evidence policy, implemented in the migration and CLI |

The 14-day threshold is this demo's policy, not a legal deadline. Principle 8 requires reasonable accuracy checks before using or disclosing personal information. Principle 9 limits retention to what the lawful purpose requires and gives no universal fixed retention period. A retention-review date starts a decision, not an automatic deletion.

Purpose and freshness fields cannot establish consent, a lawful collection basis, notification, security or permission to share. Separate duties include collection notices, including indirect collection where applicable, access and correction, storage security and overseas disclosures. Review [the Privacy Commissioner's full principles](https://www.privacy.org.nz/privacy-principles/) for the wider obligations. Do not store sensitive prospect details in demo fixtures or public reports. A human must inspect the underlying evidence before recording a result.
