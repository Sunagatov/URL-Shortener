package com.zufar.urlshortener.auth.service.validator

import com.zufar.urlshortener.shared.exception.InvalidRequestException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows

class EmailOfUserValidatorTest {

    private val validator = EmailOfUserValidator()

    @Test
    fun `valid email longer than 64 characters is accepted`() {
        val email = "${"a".repeat(50)}@very-long-example-domain.com"

        assertDoesNotThrow {
            validator.validate(email)
        }
    }

    @Test
    fun `blank email is rejected`() {
        assertThrows<InvalidRequestException> {
            validator.validate(" ")
        }
    }

    @Test
    fun `invalid email format is rejected`() {
        assertThrows<InvalidRequestException> {
            validator.validate("not-an-email")
        }
    }

    @Test
    fun `email longer than 254 characters is rejected`() {
        val email = "${"a".repeat(245)}@example.com"

        assertThrows<InvalidRequestException> {
            validator.validate(email)
        }
    }
}
