# Destination normalization

Creation and destination updates validate and store a canonical HTTP(S) URL.
Scheme and DNS host casing are normalized, Unicode domains are represented by
their ASCII IDN labels, and non-ASCII path characters are escaped. Existing
escaped path/query bytes and fragments are preserved.

For example, `HTTPS://BÜCHER.de/a?x=%2F#Part` becomes
`https://xn--bcher-kva.de/a?x=%2F#Part`. The frontend uses the browser URL parser
before submission. The backend also normalizes direct API input before host
classification, allowance reservation and persistence.

Embedded credentials, non-HTTP(S) schemes, unsafe/private resolved addresses and
service self-links remain prohibited. Normalization does not repair malformed
authorities or remove credentials. The backend's JDK IDN fallback refuses
non-round-tripping Unicode mappings such as sharp-s rather than silently
redirecting to another domain; browser clients submit the corresponding ASCII
label (`faß.de` becomes `xn--fa-hia.de`).

The homepage clears a previous success on a new submission. Clearing a pending
form invalidates its UI request state, so a late success or failure cannot
repopulate it. This does not cancel an already accepted server-side creation.
Bulk deletion waits for all outcomes, removes successful deletions immediately
and retains only failed visible selections for retry, with an explicit count.
