# Password blocklist

Bundled offline snapshot of SecLists common credentials. No user password is sent to an external service.

Source: https://raw.githubusercontent.com/danielmiessler/SecLists/913b327317496d062bcc7cace524aaad8a693be2/Passwords/Common-Credentials/10k-most-common.txt
Commit: 913b327317496d062bcc7cace524aaad8a693be2
SHA-256: 68782d6a4a19a4768d5f15dd66bd534e7a33055cc755411e33f16d18c50fdcce
License: see SecLists-LICENSE.txt.

The server also rejects trivial repetitions/suffix variants and exact account/service-name variants. This local list is a baseline, not an exhaustive check of every breach. Refresh the snapshot deliberately and rerun password-policy tests.
