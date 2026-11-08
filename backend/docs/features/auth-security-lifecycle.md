# Authentication security lifecycle

The backend and frontend must be released together for the Google PKCE contract.
Production configuration, SMTP credentials and release procedures belong in Vault.

## Passwords and recovery

New password and challenge hashes use Argon2id (19 MiB, two iterations, one lane),
with a format prefix. Existing unprefixed bcrypt hashes remain readable. A
successful password login upgrades an old password hash without changing its
session version. The 15–64 character policy supports Unicode passwords exceeding
bcrypt's former 72-byte limit; passwords are never truncated.

`POST /api/v1/auth/forgot-password` sends a 15-minute, random one-use link through
the configured SMTP provider. Configure `APP_AUTH_PASSWORD_RESET_URL` as the
trusted frontend reset route, with HTTPS outside loopback development. Request
headers never determine the link destination. Set `MAIL_HOST`, `MAIL_PORT`,
`MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH`,
`MAIL_SMTP_STARTTLS_ENABLE` and `APP_AUTH_EMAIL_VERIFICATION_MAIL_FROM` for the
provider. The local profile defaults the reset route to port 3000; the sample env
file supplies the same route for Compose. Delivery failures log only metadata,
never the token, link or SMTP exception body. Public forgot-password responses
remain generic for known and unknown addresses.

Recovery also lets Google-only users establish a local password after mailbox
proof. Completion marks the local credential mailbox-verified, makes local login
available, clears the challenge and increments `tokenVersion`. Password changes
also clear outstanding recovery challenges. Both old access and refresh JWTs
are then rejected; the frontend signs out after a successful password change.

## Account updates and verification

Every existing-account writer uses field-scoped updates with an atomic
`accountRevision` comparison and increment. Legacy documents without that field
start at revision zero. A stale profile, resend, Google-link or recovery request
cannot restore an old password, challenge or token version. Competing reset
completions have one winner.

Verification allows at most five attempts per account window. Reservations are
atomic in MongoDB and shared across backend processes. Resending replaces the
code but keeps the attempt budget until the original ten-minute window expires.
Existing IP throttling and optional Turnstile remain additional controls.

## Google identity adoption

`emailVerified` historically also meant signup with verification disabled. It is
therefore insufficient evidence that a local password belongs to the mailbox
owner. `passwordEmailVerified` is established only by an emailed verification
challenge or password recovery. On Google adoption, a local password without
this proof is removed and previous sessions/recovery credentials are revoked.
Existing account data remains. This includes legacy accounts without the new
proof field; their owners can keep Google login and use emailed recovery to
establish a new local password. Mailbox-proven local passwords remain usable.

The browser keeps an unpredictable state, S256 verifier, internal destination and
ten-minute expiry in a tab-scoped transaction. The callback validates and consumes
it before exchanging the code. `POST /api/v1/auth/google` requires both `code` and
`codeVerifier`; there is no code-only compatibility bypass. The backend forwards
the verifier to Google's token endpoint. Return destinations are stored separately
and restricted to the application's origin.

## Verification

Run `./gradlew test` and the frontend's test, lint, type-check and build commands.
Set `URL_SHORTENER_TEST_MONGO_URI` to a disposable loopback MongoDB URI without a
database name to enable the real database concurrency and authentication tests.
The tests create and remove their own uniquely named databases and use a local
SMTP capture server that never forwards mail. CI already provides this MongoDB
variable. Browser validation should additionally cover signup/code delivery,
forgot/reset, password-change logout, long Unicode passwords, OAuth transaction
binding and callback replay rejection.
