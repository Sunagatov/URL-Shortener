# URL-Shortener backend scan — verified bugs and patch scope

Repo scanned: `Sunagatov/URL-Shortener` on branch `development`

## Bugs fixed by the apply script

1. **Compile-time signup model mismatch**
   - `AuthController` creates `UserDetails(..., updatedAt = ...)`
   - `UserDetails` did not define `updatedAt`
   - Fix: added nullable `updatedAt` to the entity

2. **Expired links cleanup scheduler never starts**
   - `UrlExpirationTimeDeletionScheduler` uses `@Scheduled`
   - Application class had no `@EnableScheduling`
   - Fix: enabled scheduling on the Spring Boot application

3. **Refresh endpoint accepts any valid JWT, including access tokens**
   - Access and refresh tokens were generated identically and validated by the same method
   - Fix: added token type claim (`access` / `refresh`) and strict validators for each flow

4. **Private URL metadata endpoint leaks mappings across users**
   - `GET /api/v1/urls/{urlHash}` required authentication but did not verify ownership
   - Fix: added owner check for the private lookup path

5. **Delete endpoint allows deleting someone else’s mapping**
   - Controller docs say creator-only, but service only checked existence
   - Fix: added owner check before delete and return 403 on access violation

6. **Expired mappings remain usable until daily cleanup**
   - Redirect/provider logic only checked existence, not expiration
   - Fix: active lookup now rejects expired mappings immediately

7. **Shorten flow can return expired old mapping instead of recreating**
   - Existing hash lookup did not consider expiration
   - Fix: recreate mapping when old one is expired

8. **Trimmed URL is validated, but raw value was stored**
   - Input like `" https://example.com "` could pass validation and still be saved with spaces
   - Fix: persist normalized trimmed URL

9. **Anonymous shorten flow was brittle**
   - User id extraction could throw unexpectedly depending on auth state
   - Fix: anonymous/no-auth now safely stores `userId = null`

10. **Security config was not explicitly stateless and CORS was not wired into the security chain**
    - Fix: enabled `cors {}` and `SessionCreationPolicy.STATELESS`

11. **Wrong `AuthenticationException` import in global exception handler**
    - Imported `javax.naming.AuthenticationException` instead of Spring Security’s type
    - Fix: corrected import and added explicit 403 handler for access-denied cases

12. **Redirect endpoint declared JSON production despite returning a 302 redirect**
    - Fix: removed misleading `produces = ["application/json"]`

## Serious issues found but NOT auto-fixed in the patch

1. **`StringEncoder` uses CRC32**
   - High collision risk for a URL shortener
   - Auto-fixing this would change future generated short URLs and can create backward-compatibility / duplicate-data questions

2. **Hash generation is global per original URL, not per user/request**
   - If two users shorten the same original URL, ownership and “my URLs” semantics become inconsistent
   - Fixing this cleanly needs a deliberate product/data-model decision

3. **CI workflow does not run tests before Docker build/deploy**
   - This allows compile/runtime regressions to slip into deployment much more easily

## What the verify script does

- Makes `gradlew` executable
- Runs `./gradlew clean test`
- Greps for the key code markers from the patch
