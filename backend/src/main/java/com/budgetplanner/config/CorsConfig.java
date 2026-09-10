package com.budgetplanner.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${application.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:4173,http://localhost,https://fintrack-pro-fullstack.vercel.app}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ── Allowed Origins & Patterns (AWS Deployment Ready) ───────────────
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        // Enable pattern matching for AWS hostnames / custom domains with credentials
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedOrigins(origins);

        // ── Allowed HTTP Methods ────────────────────────────────────────────
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // ── Allowed Headers ─────────────────────────────────────────────────
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Cache-Control"
        ));

        // ── Expose Authorization header to frontend ─────────────────────────
        configuration.setExposedHeaders(List.of("Authorization"));

        // ── Allow credentials (cookies / Authorization header) ──────────────
        configuration.setAllowCredentials(true);

        // ── Pre-flight cache duration ───────────────────────────────────────
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
