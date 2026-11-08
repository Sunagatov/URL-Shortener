package com.zufar.urlshortener.shared.security

import com.zufar.urlshortener.shared.exception.ApplicationException
import jakarta.validation.Constraint
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext
import jakarta.validation.Payload
import java.text.Normalizer
import java.util.Locale
import kotlin.reflect.KClass

/** Apply to newly established passwords, never to legacy sign-in inputs. */
object PasswordPolicy {
    private val commonPasswords = requireNotNull(javaClass.getResourceAsStream("/security/common-passwords.txt"))
        .bufferedReader().useLines { lines -> lines.filter(String::isNotBlank).map { it.lowercase(Locale.ROOT) }.toSet() }

    fun normalize(value: String): String = Normalizer.normalize(value, Normalizer.Form.NFC)

    fun error(value: String): String? {
        if (value.indices.any { i ->
                (value[i].isHighSurrogate() && (i + 1 >= value.length || !value[i + 1].isLowSurrogate())) ||
                (value[i].isLowSurrogate() && (i == 0 || !value[i - 1].isHighSurrogate())) })
            return "Password contains invalid Unicode characters"
        val normalized = normalize(value)
        val length = normalized.codePointCount(0, normalized.length)
        if (length < 15) return "Password must be at least 15 characters long"
        if (length > 64) return "Password must be 64 characters or less"
        val folded = normalized.lowercase(Locale.ROOT)
        val withoutSuffix = folded.trimEnd { !it.isLetter() }
        if (folded in commonPasswords || withoutSuffix in commonPasswords ||
            listOf(folded, withoutSuffix).any { candidate -> (2..4).any { repeats ->
                candidate.length % repeats == 0 &&
                candidate.take(candidate.length / repeats).repeat(repeats) == candidate &&
                candidate.take(candidate.length / repeats) in commonPasswords } }) {
            return "Choose a less common password or a longer unique passphrase"
        }
        return null
    }

    fun requireAcceptable(value: String, email: String) {
        val folded = normalize(value).lowercase(Locale.ROOT)
        val contextual = setOf(email.lowercase(Locale.ROOT), email.substringBefore('@').lowercase(Locale.ROOT),
            "urlshortener", "url-shortener", "shorty")
        val message = error(value) ?: if (contextual.any { base -> base.isNotBlank() &&
                (1..4).any { folded == base.repeat(it) || folded.trimEnd { !it.isLetter() } == base.repeat(it) } })
            "Choose a password different from your email or this service name" else null
        if (message != null) throw ApplicationException.badRequest("WEAK_PASSWORD", message)
    }
}

@Target(AnnotationTarget.FIELD, AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [NewPasswordValidator::class])
annotation class NewPassword(
    val message: String = "Choose a unique password of 15 to 64 characters",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = []
)

class NewPasswordValidator : ConstraintValidator<NewPassword, String> {
    override fun isValid(value: String?, context: ConstraintValidatorContext): Boolean {
        if (value == null) return false
        val error = PasswordPolicy.error(value) ?: return true
        context.disableDefaultConstraintViolation()
        context.buildConstraintViolationWithTemplate(error).addConstraintViolation()
        return false
    }
}
