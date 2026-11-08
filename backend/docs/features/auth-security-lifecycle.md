# Authentication security lifecycle

The backend and frontend must be released together for the Google PKCE contract.
Production configuration, SMTP credentials and release procedures belong in Vault.

## Passwords and recovery

New password and challenge hashes use Argon2id (19 MiB, two iterations, one lane),
with an `argon2id-nfc` format prefix. Existing unprefixed/prefixed bcrypt and
`argon2id` hashes remain readable with their original, unnormalized input. A
successful password login upgrades an old password hash without changing its
session version. The 15–64 character policy supports Unicode passwords exceeding
bcrypt's former 72-byte limit; passwords are never truncated. New passwords are
normalized to NFC and counted by Unicode code points. Signup, recovery and
password change share a bundled common-password blocklist and exact account/service
name checks. Existing passwords are not rejected by the new policy during login.
See the [blocklist provenance](../../src/main/resources/security/README.md).

`POST /api/v1/auth/forgot-password` sends a 15-minute, random one-use link through
the configured SMTP provider. Configure `APP_AUTH_PASSWORD_RESET_URL` as the
trusted frontend reset route, with HTTPS outside loopback development. Request
headers never determine the link destination. Set `MAIL_HOST`, `MAIL_PORT`,
`MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH`,
`MAIL_SMTP_STARTTLS_ENABLE`, `MAIL_SMTP_STARTTLS_REQUIRED` and `APP_AUTH_EMAIL_VERIFICATION_MAIL_FROM` for the
provider. The local profile defaults the reset route to port 3000; the sample env
file supplies the same route for Compose. Delivery failures log only metadata,
never the token, link or SMTP exception body. Public forgot-password responses
remain generic for known and unknown addresses.

Remote SMTP requires STARTTLS by default, validates server identity and has finite
timeouts. Explicitly disable the TLS requirement only for isolated loopback test
mail servers. Recovery has an atomic per-account 60-second resend cooldown and
five-message hourly budget, shared across processes and IPs. Suppressed requests
keep the usable token and return the same generic success. Completing recovery
does not reset the mail budget.

Recovery also lets Google-only users establish a local password after mailbox
proof. Completion marks the local credential mailbox-verified, makes local login
available, clears the challenge and increments `tokenVersion`. Password changes
also clear outstanding recovery challenges. Both old access and refresh JWTs
are then rejected; the frontend signs out after a successful password change.
Recovery pages are reachable with or without existing browser credentials, and
successful reset clears the browser session before the next sign-in.

## Login and logout

Password login reserves one of ten attempts per normalized account in a fixed
15-minute window before authentication. The MongoDB CAS makes this budget shared
and concurrency-safe; IP limits and Turnstile remain additional controls. A
successful login clears its reserved budget only if the account has not changed.
Blocked attempts do not extend the window. Recovery remains available and resets
the login budget after successful mailbox proof.

`POST /api/v1/auth/logout` accepts a refresh token and access token in its body,
explicitly validates either live credential (including when refresh has expired)
and atomically increments the account token version. Logout signs out **all
devices**, including copied access and refresh credentials. Repeated logout of an
already revoked token is harmless. CAS conflicts retry, and unresolved failure is
reported rather than claiming success. The UI waits for acknowledgement and
retains a retryable session on network failure.

Unchecked Remember me stores credentials only in sessionStorage; checked uses
localStorage. Login switches clear both stores, refresh retains the selected
mode, and late refresh results cannot restore a logged-out or replaced session.
Browser-readable tokens remain an architectural tradeoff; HttpOnly cookie/BFF
migration and passkeys are separate optional work, not included in this patch.

Storage changes now notify the authentication provider, including refresh failure
on a public route. Persistent sessions also reconcile browser storage events and
focus, so a cleared session does not leave a stale signed-in header. A delayed
logout acknowledgement cannot erase a replacement login. Server/network errors
still retain a retryable session rather than claiming revocation succeeded.

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

The backend requires Google's stable `sub`, stores it in a unique sparse MongoDB
index and resolves established subjects before email. Provider email changes do
not move an existing binding or change the local email. A different bound subject
cannot be replaced by a matching email. First automatic binding requires verified
Gmail or a verified Workspace email matching its `hd` domain. Other third-party
Google addresses must first sign up/verify locally or use mailbox recovery, then
sign in with a password and choose Link Google account in Security. Legacy
third-party Google-only accounts without a subject follow the same recovery path.
An explicit link requires the same mailbox-proven local account and authentication
within five minutes. JWT `authTime` preserves the original authentication time
through refresh; legacy JWTs without that claim cannot be used as linking proof.

## Verification

Run `./gradlew test` and the frontend's test, lint, type-check and build commands.
Set `URL_SHORTENER_TEST_MONGO_URI` to a disposable loopback MongoDB URI without a
database name to enable the real database concurrency and authentication tests.
The tests create and remove their own uniquely named databases and use a local
SMTP capture server that never forwards mail. CI already provides this MongoDB
variable. Browser validation should additionally cover signup/code delivery,
forgot/reset, password-change logout, long Unicode passwords, OAuth transaction
binding and callback replay rejection.
