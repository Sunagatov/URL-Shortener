package com.zufar.urlshortener.shared.config

import com.zufar.urlshortener.auth.security.CustomUserDetailsService
import com.zufar.urlshortener.auth.security.JwtAuthenticationFilter
import com.zufar.urlshortener.shared.filter.RateLimitFilter
import com.zufar.urlshortener.shared.API_DOCS_PATH_PREFIX
import com.zufar.urlshortener.shared.DOCS_PATH_PREFIX
import com.zufar.urlshortener.shared.security.RestAccessDeniedHandler
import com.zufar.urlshortener.shared.security.RestAuthenticationEntryPoint
import com.zufar.urlshortener.urls.UrlHashFormat
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
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher.withDefaults
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.util.matcher.RegexRequestMatcher

@Configuration
@EnableMethodSecurity
class SecurityConfig(
    private val customUserDetailsService: CustomUserDetailsService,
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
    fun securityFilterChain(
        http: HttpSecurity,
        passwordEncoder: PasswordEncoder
    ): SecurityFilterChain {
        val publicShortUrlMatcher = RegexRequestMatcher(UrlHashFormat.SECURITY_REGEX, HttpMethod.GET.name())

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
                    .requestMatchers(HttpMethod.POST, "/api/v1/frontend/logs").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/urls").permitAll()
                    .requestMatchers(withDefaults().matcher(HttpMethod.GET, "/favicon.ico")).permitAll()
                    .requestMatchers(publicShortUrlMatcher).permitAll()
                    .requestMatchers(
                        "/api/v1/health",
                        "/api/v1/auth/**",
                        "/v1/auth/**",
                        "$DOCS_PATH_PREFIX/**",
                        "$API_DOCS_PATH_PREFIX/**"
                    ).permitAll()
                    .anyRequest().authenticated()
            }
            .authenticationProvider(daoAuthenticationProvider(passwordEncoder))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
            .addFilterAfter(rateLimitFilter, JwtAuthenticationFilter::class.java)

        return http.build()
    }
}
