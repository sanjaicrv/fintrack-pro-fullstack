package com.budgetplanner.controller;

import com.budgetplanner.constants.AppConstants;
import com.budgetplanner.dto.request.ChangePasswordRequest;
import com.budgetplanner.dto.request.UserUpdateRequest;
import com.budgetplanner.dto.response.UserResponse;
import com.budgetplanner.entity.User;
import com.budgetplanner.exception.BadRequestException;
import com.budgetplanner.exception.UnauthorizedException;
import com.budgetplanner.repository.UserRepository;
import com.budgetplanner.response.ApiResponse;
import com.budgetplanner.service.UserService;
import com.budgetplanner.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.USER_BASE)
@RequiredArgsConstructor
@Tag(name = "User", description = "User profile and settings management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── GET /api/v1/users/me ──────────────────────────────────────────────────
    @Operation(
        summary = "Get current user profile",
        description = "Returns the authenticated user's profile data including theme preference"
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile returned"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse userResponse = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    // ── PUT /api/v1/users/me ──────────────────────────────────────────────────
    @Operation(
        summary = "Update user profile",
        description = "Updates the authenticated user's first name, last name and theme preference. " +
                      "This is called from the Settings page in the frontend."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(
            @Valid @RequestBody UserUpdateRequest request) {

        UserResponse updated = userService.updateCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.USER_UPDATED, updated));
    }

    // ── PATCH /api/v1/users/me/theme ──────────────────────────────────────────
    @Operation(
        summary = "Toggle theme",
        description = "Toggles the user's theme between LIGHT and DARK. " +
                      "Called from the theme toggle button present in the app navbar."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Theme toggled"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PatchMapping("/me/theme")
    public ResponseEntity<ApiResponse<UserResponse>> toggleTheme() {
        UserResponse updated = userService.toggleTheme();
        return ResponseEntity.ok(ApiResponse.success("Theme updated successfully", updated));
    }

    // ── PATCH /api/v1/users/me/password ───────────────────────────────────────
    @Operation(
        summary = "Change password",
        description = "Changes the authenticated user's password after verifying current password"
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password changed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Passwords do not match or validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Current password is incorrect")
    })
    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        User currentUser = SecurityUtils.getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
