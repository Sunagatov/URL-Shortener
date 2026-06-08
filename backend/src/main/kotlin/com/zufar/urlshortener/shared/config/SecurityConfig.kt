package com.zufar.urlshortener.shared.config

import com.zufar.urlshortener.auth.security.CustomUserDetailsService
import com.zufar.urlshortener.auth.security.JwtAuthenticationFilter
import com.zufar.urlshortener.shared.filter.CorrelationIdFilter
import com.zufar.urlshortener.shared.filter.RateLimitFilter
import com.zufar.urlshortener.shared.filter.RequestCompletionLoggingFilter
import com.zufar.urlshortener.shared.filter.SecurityHeadersFilter
import com.zufar.urlshortener.shared.security.RestAccessDeniedHandler
import com.zufar.urlshortener.shared.security.RestAuthenticationEntryPoint
import com.zufar.urlshortener.shared.web.ApplicationRoutes
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
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
    private val correlationIdFilter: CorrelationIdFilter,
    private val securityHeadersFilter: SecurityHeadersFilter,
    private val requestCompletionLoggingFilter: RequestCompletionLoggingFilter,
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val rateLimitFilter: RateLimitFilter,
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
    fun correlationIdFilterRegistration(filter: CorrelationIdFilter): FilterRegistrationBean<CorrelationIdFilter> =
        FilterRegistrationBean(filter).apply { isEnabled = false }

    @Bean
    fun requestCompletionLoggingFilterRegistration(
        filter: RequestCompletionLoggingFilter
    ): FilterRegistrationBean<RequestCompletionLoggingFilter> =
        FilterRegistrationBean(filter).apply { isEnabled = false }

    @Bean
    fun securityHeadersFilterRegistration(filter: SecurityHeadersFilter): FilterRegistrationBean<SecurityHeadersFilter> =
        FilterRegistrationBean(filter).apply { isEnabled = false }

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
                    .requestMatchers(*ApplicationRoutes.securityPermitAllMatchers()).permitAll()
                    .anyRequest().authenticated()
            }
            .authenticationProvider(daoAuthenticationProvider(passwordEncoder))
            .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter::class.java)
            .addFilterAfter(securityHeadersFilter, CorrelationIdFilter::class.java)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
            .addFilterAfter(rateLimitFilter, JwtAuthenticationFilter::class.java)
            .addFilterAfter(requestCompletionLoggingFilter, RateLimitFilter::class.java)

        return http.build()
    }
}
