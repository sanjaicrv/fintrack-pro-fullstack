package com.budgetplanner.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private DateUtils() {}

    public static final DateTimeFormatter MONTH_YEAR_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");
    public static final DateTimeFormatter ISO_DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    /**
     * Returns the first day of the given year/month.
     */
    public static LocalDate startOfMonth(int year, int month) {
        return LocalDate.of(year, month, 1);
    }

    /**
     * Returns the last day of the given year/month.
     */
    public static LocalDate endOfMonth(int year, int month) {
        LocalDate start = startOfMonth(year, month);
        return start.withDayOfMonth(start.lengthOfMonth());
    }

    /**
     * Formats a LocalDate as "MMM yyyy" (e.g. "Jan 2024").
     */
    public static String formatMonthYear(LocalDate date) {
        return date.format(MONTH_YEAR_FORMATTER);
    }

    /**
     * Returns LocalDate for N months ago from today.
     */
    public static LocalDate monthsAgo(int months) {
        return LocalDate.now().minusMonths(months).withDayOfMonth(1);
    }
}
