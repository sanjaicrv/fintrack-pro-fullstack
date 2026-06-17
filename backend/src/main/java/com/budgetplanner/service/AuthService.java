package com.budgetplanner.service;

import com.budgetplanner.dto.request.LoginRequest;
import com.budgetplanner.dto.request.RegisterRequest;
import com.budgetplanner.dto.request.ForgotPasswordRequest;
import com.budgetplanner.dto.request.VerifyOtpRequest;
import com.budgetplanner.dto.request.ResetPasswordRequest;
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

    /**
     * Triggers the forgot-password flow by verifying the email, generating a secure 6-digit OTP,
     * and sending it to the user's registered email address.
     */
    void processForgotPassword(ForgotPasswordRequest request);

    /**
     * Checks if the OTP code provided matches and is still valid (not expired).
     */
    boolean verifyOtp(VerifyOtpRequest request);

    /**
     * Validates matching password entries, BCrypt encodes the new password, updates the user account,
     * and invalidates/deletes the OTP token.
     */
    void resetPassword(ResetPasswordRequest request);
}
