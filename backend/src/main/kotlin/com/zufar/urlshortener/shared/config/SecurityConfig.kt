package com.zufar.urlshortener.shared.config

import com.zufar.urlshortener.auth.service.CustomUserDetailsService
import com.zufar.urlshortener.auth.service.JwtAuthenticationFilter
import com.zufar.urlshortener.shared.security.RestAccessDeniedHandler
import com.zufar.urlshortener.shared.security.RestAuthenticationEntryPoint
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableMethodSecurity
class SecurityConfig(
    private val customUserDetailsService: CustomUserDetailsService,
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val restAuthenticationEntryPoint: RestAuthenticationEntryPoint,
    private val restAccessDeniedHandler: RestAccessDeniedHandler
) {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    private fun daoAuthenticationProvider(passwordEncoder: PasswordEncoder): DaoAuthenticationProvider {
        val authProvider = DaoAuthenticationProvider(customUserDetailsService)
        authProvider.setPasswordEncoder(passwordEncoder)
        return authProvider
    }

    @Bean
    fun authenticationManager(passwordEncoder: PasswordEncoder): AuthenticationManager =
        ProviderManager(daoAuthenticationProvider(passwordEncoder))

    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        passwordEncoder: PasswordEncoder
    ): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { }
            .exceptionHandling {
                it.authenticationEntryPoint(restAuthenticationEntryPoint)
                it.accessDeniedHandler(restAccessDeniedHandler)
            }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/urls").permitAll()
                    .requestMatchers(
                        "/api/v1/health",
                        "/api/v1/auth/**",
                        "/v1/auth/**",
                        "/{urlHash:[1-9A-HJ-NP-Za-km-z]{8}}",
                        "/api/v1/swagger-ui/**",
                        "/api/v1/api-docs/**"
                    ).permitAll()
                    .anyRequest().authenticated()
            }
            .authenticationProvider(daoAuthenticationProvider(passwordEncoder))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }
}
