package com.budgetplanner.service;

import com.budgetplanner.dto.request.UserUpdateRequest;
import com.budgetplanner.dto.response.UserResponse;
import com.budgetplanner.entity.User;

public interface UserService {

    /**
     * Returns the current authenticated user's profile.
     */
    UserResponse getCurrentUserProfile();

    /**
     * Updates the current user's profile (name, theme preference).
     */
    UserResponse updateCurrentUser(UserUpdateRequest request);

    /**
     * Toggles the theme preference (light ↔ dark) for the current user.
     */
    UserResponse toggleTheme();

    /**
     * Returns the raw User entity by ID (internal use).
     */
    User getUserEntityById(Long id);
}
