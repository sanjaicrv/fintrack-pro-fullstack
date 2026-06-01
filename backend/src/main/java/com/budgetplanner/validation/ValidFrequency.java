package com.budgetplanner.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = FrequencyValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidFrequency {

    String message() default "Frequency must be provided when recurring is true";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
