package com.budgetplanner.util;

import com.budgetplanner.entity.User;
import com.budgetplanner.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Returns the currently authenticated User from the SecurityContext.
     * Throws UnauthorizedException if no authenticated user is found.
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (User) authentication.getPrincipal();
    }

    /**
     * Returns the currently authenticated user's ID.
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Returns true if there is an authenticated user in context.
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof User;
    }
}
