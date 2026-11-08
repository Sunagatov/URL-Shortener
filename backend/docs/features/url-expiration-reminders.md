# Optional URL expiration email reminders

Link creation accepts an optional expirationReminder boolean, default false.
The signed-in owner must have mailbox proof from local verification/recovery or
an established Google subject. The historical emailVerified flag alone is not
sufficient. Anonymous requests and unproven legacy mailboxes cannot opt in.
The reminder flag is inserted atomically with the mapping; existing mappings
remain opted out. Disabled/expired/deleted mappings are not selected.

The frontend exposes an unchecked opt-in under Advanced options for signed-in
users. A reminder becomes due within 24 hours before link expiration. Delete a
link before processing starts to cancel a pending reminder; an email already
being delivered cannot be recalled. Destination URLs are not included in mail.

When enabled, Spring schedules bounded polling. MongoDB find-and-modify claims a
mapping with a five-minute lease before delivery. Separate rolling account and
global mail allowances survive process restarts; suppressed jobs are deferred.
Provider failures retry after a delay, with at most three persisted SMTP attempts.
Success is recorded only after the mail sender returns. An ambiguous SMTP
acknowledgement or worker crash after sending can cause a retry/duplicate; this
is not an exactly-once delivery guarantee or a monetary spending cap.

Runtime enablement and SMTP credentials belong in
[Vault](https://github.com/Sunagatov/Vault/blob/development/apps/url-shortener/backend/POSTMARK_SMTP_SETUP.md).
The source defaults and environment-property names are in application.properties.
When reminders are disabled, creation cannot accept a new reminder opt-in.
The current release must retain the password hash decoder described in the
[authentication lifecycle](auth-security-lifecycle.md) during recovery/rollback.

The integration tests use disposable MongoDB and captured mail. They exercise
automatic scheduled execution, concurrent claims, attempt/usage bounds and
mailbox-proof requirements. These tests do not prove external provider delivery.
