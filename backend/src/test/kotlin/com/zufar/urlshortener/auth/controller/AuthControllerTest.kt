package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.JwtTokenProvider
import com.zufar.urlshortener.auth.service.validator.AuthRequestValidator
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.User
import org.springframework.security.crypto.password.PasswordEncoder
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthControllerTest {

    @Mock private lateinit var authenticationManager: AuthenticationManager
    @Mock private lateinit var jwtTokenProvider: JwtTokenProvider
    @Mock private lateinit var authRequestValidator: AuthRequestValidator
    @Mock private lateinit var userRepository: UserRepository
    @Mock private lateinit var passwordEncoder: PasswordEncoder

    private fun controller() = AuthController(
        authenticationManager = authenticationManager,
        jwtTokenProvider = jwtTokenProvider,
        authRequestValidator = authRequestValidator,
        userRepository = userRepository,
        passwordEncoder = passwordEncoder
    )

    @Test
    fun `registerUser lowercases and trims email before save`() {
        whenever(passwordEncoder.encode("SecurePassword123!")).thenReturn("hashed-password")
        whenever(userRepository.save(any<UserDetails>())).thenAnswer { it.arguments[0] }
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token")

        controller().registerUser(
            SignUpRequest(
                firstName = "Jane",
                lastName = "Doe",
                country = "USA",
                age = 28,
                email = "  Jane.Doe@Example.COM  ",
                password = "SecurePassword123!"
            )
        )

        verify(userRepository).findByEmailIgnoreCase("jane.doe@example.com")
        val captor = ArgumentCaptor.forClass(UserDetails::class.java)
        verify(userRepository).save(captor.capture())
        assertEquals("jane.doe@example.com", captor.value.email)
    }

    @Test
    fun `registerUser duplicate check is case-insensitive`() {
        whenever(userRepository.findByEmailIgnoreCase("jane.doe@example.com")).thenReturn(
            UserDetails(
                firstName = "Jane",
                lastName = "Doe",
                email = "jane.doe@example.com",
                password = "hashed",
                country = "USA",
                age = 28
            )
        )

        assertThrows<EmailAlreadyExistsException> {
            controller().registerUser(
                SignUpRequest(
                    firstName = "Jane",
                    lastName = "Doe",
                    country = "USA",
                    age = 28,
                    email = "Jane.Doe@Example.COM",
                    password = "SecurePassword123!"
                )
            )
        }
    }

    @Test
    fun `authenticateUser passes normalized email to authentication manager`() {
        val principal = User("user@example.com", "hashed", emptyList())
        whenever(authenticationManager.authenticate(any())).thenReturn(
            UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        )
        whenever(jwtTokenProvider.generateAccessToken(principal)).thenReturn("access-token")
        whenever(jwtTokenProvider.generateRefreshToken(principal)).thenReturn("refresh-token")

        controller().authenticateUser(SignInRequest("  User@Example.COM  ", "password"))

        val captor = ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken::class.java)
        verify(authenticationManager).authenticate(captor.capture())
        assertEquals("user@example.com", captor.value.principal)
    }

    @Test
    fun `refreshAccessToken looks up normalized email from token subject`() {
        val user = UserDetails(
            firstName = "User",
            lastName = "Test",
            email = "user@example.com",
            password = "hashed",
            country = "USA",
            age = 30
        )
        whenever(jwtTokenProvider.validateRefreshToken("refresh-token")).thenReturn(true)
        whenever(jwtTokenProvider.getUsernameFromJWT("refresh-token")).thenReturn("  User@Example.COM  ")
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("new-access-token")

        val response = controller().refreshAccessToken(RefreshTokenRequest("refresh-token"))

        verify(userRepository).findByEmailIgnoreCase("user@example.com")
        assertEquals("new-access-token", response.body?.accessToken)
    }
}
