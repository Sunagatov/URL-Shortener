package com.zufar.urlshortener.auth.service.authentication

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.auth.service.support.AuthTokenIssuer
import com.zufar.urlshortener.auth.validation.AuthRequestValidator
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.User
import org.springframework.stereotype.Service

@Service
class SignInService(
    private val authenticationManager: AuthenticationManager,
    private val authRequestValidator: AuthRequestValidator,
    private val authTokenIssuer: AuthTokenIssuer
) {

    fun authenticate(signInRequest: SignInRequest): AuthResponse {
        val normalizedRequest = signInRequest.copy(email = EmailNormalizer.normalize(signInRequest.email))
        authRequestValidator.validateAuthRequest(normalizedRequest)

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(normalizedRequest.email, signInRequest.password)
        )

        return authTokenIssuer.issueAuthentication(authentication.principal as User)
    }
}
