package com.budgetplanner.service;

import com.budgetplanner.dto.request.LoginRequest;
import com.budgetplanner.dto.request.RegisterRequest;
import com.budgetplanner.dto.response.AuthResponse;

public interface AuthService {

    /**
     * Registers a new user, hashes their password, and returns a JWT.
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticates an existing user and returns a JWT.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Issues a new access token from a valid refresh token.
     */
    AuthResponse refreshToken(String refreshToken);
}
