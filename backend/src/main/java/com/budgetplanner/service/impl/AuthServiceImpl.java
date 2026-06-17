package com.budgetplanner.service.impl;

import com.budgetplanner.dto.request.LoginRequest;
import com.budgetplanner.dto.request.RegisterRequest;
import com.budgetplanner.dto.request.ForgotPasswordRequest;
import com.budgetplanner.dto.request.VerifyOtpRequest;
import com.budgetplanner.dto.request.ResetPasswordRequest;
import com.budgetplanner.dto.response.AuthResponse;
import com.budgetplanner.entity.User;
import com.budgetplanner.entity.OtpToken;
import com.budgetplanner.exception.BadRequestException;
import com.budgetplanner.exception.DuplicateResourceException;
import com.budgetplanner.exception.UnauthorizedException;
import com.budgetplanner.repository.UserRepository;
import com.budgetplanner.repository.OtpTokenRepository;
import com.budgetplanner.security.JwtService;
import com.budgetplanner.service.AuthService;
import com.budgetplanner.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .theme(User.Theme.LIGHT)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully with id: {}", user.getId());

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.info("User logged in successfully: {}", user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        String userEmail = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new UnauthorizedException("Refresh token is expired or invalid");
        }

        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Override
    @Transactional
    public void processForgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        log.info("Processing forgot password request for email: {}", email);

        if (!userRepository.existsByEmail(email)) {
            throw new com.budgetplanner.exception.ResourceNotFoundException("User not found with email: " + email);
        }

        // Generate a secure 6-digit OTP
        String otp = generateSecureOtp();

        // Expire in 5 minutes
        java.time.LocalDateTime expiryDate = java.time.LocalDateTime.now().plusMinutes(5);

        // Delete any existing OTP token for this email to avoid duplicates
        otpTokenRepository.findByEmail(email).ifPresent(otpTokenRepository::delete);

        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otpCode(otp)
                .expiryDate(expiryDate)
                .build();

        otpTokenRepository.save(otpToken);
        log.info("OTP generated and saved for email: {}", email);

        // Send OTP via email
        emailService.sendOtpEmail(email, otp);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        String code = request.getOtpCode().trim();
        log.info("Verifying OTP for email: {}", email);

        OtpToken otpToken = otpTokenRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No OTP found for this email"));

        if (!otpToken.getOtpCode().equals(code)) {
            throw new BadRequestException("Invalid OTP code");
        }

        if (java.time.LocalDateTime.now().isAfter(otpToken.getExpiryDate())) {
            throw new BadRequestException("OTP has expired");
        }

        return true;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        log.info("Resetting password for email: {}", email);

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        // Verify OTP code matches, exists, and not expired
        OtpToken otpToken = otpTokenRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No OTP found for this email"));

        if (!otpToken.getOtpCode().equals(request.getOtpCode().trim())) {
            throw new BadRequestException("Invalid OTP code");
        }

        if (java.time.LocalDateTime.now().isAfter(otpToken.getExpiryDate())) {
            throw new BadRequestException("OTP has expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.budgetplanner.exception.ResourceNotFoundException("User not found with email: " + email));

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate/delete the OTP token
        otpTokenRepository.delete(otpToken);
        log.info("Password reset successful and OTP invalidated for email: {}", email);
    }

    private String generateSecureOtp() {
        java.security.SecureRandom random = new java.security.SecureRandom();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .theme(user.getTheme())
                .build();
    }
}
