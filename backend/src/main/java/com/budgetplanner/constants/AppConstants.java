package com.budgetplanner.constants;

public final class AppConstants {

    private AppConstants() {}

    // API Versioning
    public static final String API_VERSION = "/v1";
    public static final String API_BASE = "/api/v1";

    // Auth endpoints
    public static final String AUTH_BASE = API_VERSION + "/auth";
    public static final String AUTH_REGISTER = "/register";
    public static final String AUTH_LOGIN = "/login";
    public static final String AUTH_REFRESH = "/refresh-token";

    // Resource endpoints
    public static final String INCOME_BASE = API_VERSION + "/incomes";
    public static final String EXPENSE_BASE = API_VERSION + "/expenses";
    public static final String GOAL_BASE = API_VERSION + "/goals";
    public static final String ANALYTICS_BASE = API_VERSION + "/analytics";
    public static final String USER_BASE = API_VERSION + "/users";

    // Pagination defaults
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final String DEFAULT_SORT_BY = "date";
    public static final String DEFAULT_SORT_DIR = "desc";

    // Frequency values
    public static final String FREQUENCY_WEEKLY = "WEEKLY";
    public static final String FREQUENCY_BIWEEKLY = "BIWEEKLY";
    public static final String FREQUENCY_MONTHLY = "MONTHLY";
    public static final String FREQUENCY_YEARLY = "YEARLY";

    // Expense categories
    public static final String[] EXPENSE_CATEGORIES = {
        "HOUSING", "TRANSPORTATION", "FOOD", "UTILITIES", "INSURANCE",
        "HEALTHCARE", "DEBT_PAYMENTS", "ENTERTAINMENT", "PERSONAL_CARE",
        "EDUCATION", "CLOTHING", "GIFTS_DONATIONS", "SAVINGS", "OTHER"
    };

    // Theme
    public static final String THEME_LIGHT = "light";
    public static final String THEME_DARK = "dark";

    // JWT
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String AUTHORIZATION_HEADER = "Authorization";

    // Success Messages
    public static final String INCOME_CREATED = "Income created successfully";
    public static final String INCOME_UPDATED = "Income updated successfully";
    public static final String INCOME_DELETED = "Income deleted successfully";
    public static final String EXPENSE_CREATED = "Expense created successfully";
    public static final String EXPENSE_UPDATED = "Expense updated successfully";
    public static final String EXPENSE_DELETED = "Expense deleted successfully";
    public static final String GOAL_CREATED = "Goal created successfully";
    public static final String GOAL_UPDATED = "Goal updated successfully";
    public static final String GOAL_DELETED = "Goal deleted successfully";
    public static final String USER_UPDATED = "User updated successfully";

    // Error Messages
    public static final String INCOME_NOT_FOUND = "Income not found with id: ";
    public static final String EXPENSE_NOT_FOUND = "Expense not found with id: ";
    public static final String GOAL_NOT_FOUND = "Goal not found with id: ";
    public static final String USER_NOT_FOUND = "User not found with id: ";
    public static final String EMAIL_ALREADY_EXISTS = "Email already in use: ";
    public static final String INVALID_CREDENTIALS = "Invalid email or password";
    public static final String ACCESS_DENIED = "You do not have permission to access this resource";
}
