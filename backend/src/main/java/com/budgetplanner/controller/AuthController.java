package com.budgetplanner.controller;

import com.budgetplanner.constants.AppConstants;
import com.budgetplanner.dto.request.LoginRequest;
import com.budgetplanner.dto.request.RefreshTokenRequest;
import com.budgetplanner.dto.request.RegisterRequest;
import com.budgetplanner.dto.response.AuthResponse;
import com.budgetplanner.response.ApiResponse;
import com.budgetplanner.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.AUTH_BASE)
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login and token refresh endpoints")
public class AuthController {

    private final AuthService authService;

    // ── POST /api/v1/auth/register ───────────────────────────────────────────
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account and returns JWT access + refresh tokens"
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201", description = "User registered successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409", description = "Email already in use")
    })
    @PostMapping(AppConstants.AUTH_REGISTER)
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse authResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", authResponse));
    }

    // ── POST /api/v1/auth/login ──────────────────────────────────────────────
    @Operation(
        summary = "Login",
        description = "Authenticates an existing user and returns JWT access + refresh tokens"
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Login successful"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping(AppConstants.AUTH_LOGIN)
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    // ── POST /api/v1/auth/refresh-token ─────────────────────────────────────
    @Operation(
        summary = "Refresh access token",
        description = "Issues a new access token using a valid refresh token"
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Token refreshed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", description = "Refresh token is expired or invalid")
    })
    @PostMapping(AppConstants.AUTH_REFRESH)
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        AuthResponse authResponse = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
    }
}
