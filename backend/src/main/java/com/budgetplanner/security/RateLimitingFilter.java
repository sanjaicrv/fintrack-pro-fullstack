package com.budgetplanner.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-performance sliding window Rate Limiting Filter to protect sensitive
 * authentication endpoints from brute-force and credential stuffing attacks.
 */
@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map: IP + ":" + endpoint -> BucketState
    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    // Limits per endpoint
    private static final int LOGIN_MAX_REQUESTS = 10;
    private static final long LOGIN_WINDOW_MILLIS = 60_000L; // 1 minute

    private static final int FORGOT_PASSWORD_MAX_REQUESTS = 5;
    private static final long FORGOT_PASSWORD_WINDOW_MILLIS = 60_000L; // 1 minute

    private static class RequestCounter {
        final long windowStart;
        final AtomicInteger count;

        RequestCounter(long windowStart) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(1);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Only rate limit POST requests to /api/v1/auth/login and /api/v1/auth/forgot-password
        if ("POST".equalsIgnoreCase(method)) {
            if (path.endsWith("/v1/auth/login")) {
                if (isRateLimited(request, "login", LOGIN_MAX_REQUESTS, LOGIN_WINDOW_MILLIS, response)) {
                    return;
                }
            } else if (path.endsWith("/v1/auth/forgot-password")) {
                if (isRateLimited(request, "forgot-password", FORGOT_PASSWORD_MAX_REQUESTS, FORGOT_PASSWORD_WINDOW_MILLIS, response)) {
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(HttpServletRequest request,
                                  String endpointKey,
                                  int maxRequests,
                                  long windowMillis,
                                  HttpServletResponse response) throws IOException {

        String clientIp = getClientIp(request);
        String key = clientIp + ":" + endpointKey;
        long now = System.currentTimeMillis();

        // Periodically clean up entries older than 2 minutes
        if (requestCounts.size() > 10_000) {
            requestCounts.entrySet().removeIf(e -> now - e.getValue().windowStart > 120_000L);
        }

        RequestCounter counter = requestCounts.compute(key, (k, existing) -> {
            if (existing == null || (now - existing.windowStart) > windowMillis) {
                return new RequestCounter(now);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (counter.count.get() > maxRequests) {
            long remainingMillis = (counter.windowStart + windowMillis) - now;
            long retryAfterSeconds = Math.max(1, remainingMillis / 1000L);

            log.warn("Rate limit exceeded for IP {} on {}. Attempts: {}, Retry-After: {}s",
                    clientIp, endpointKey, counter.count.get(), retryAfterSeconds);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));

            Map<String, Object> errorPayload = Map.of(
                    "success", false,
                    "message", "Too many requests. Please wait " + retryAfterSeconds + " seconds before retrying.",
                    "retryAfterSeconds", retryAfterSeconds,
                    "timestamp", Instant.now().toString()
            );

            response.getWriter().write(objectMapper.writeValueAsString(errorPayload));
            return true;
        }

        return false;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
