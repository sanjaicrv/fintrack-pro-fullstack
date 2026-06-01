package com.budgetplanner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ── Allowed Origins ─────────────────────────────────────────────────
        // Update these when deploying to production
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",   // Vite dev server (default)
                "http://localhost:3000",   // Alternative local port
                "http://localhost:4173"    // Vite preview
        ));

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
