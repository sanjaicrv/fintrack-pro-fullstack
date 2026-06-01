package com.budgetplanner.validation;

import com.budgetplanner.entity.Frequency;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class FrequencyValidator implements ConstraintValidator<ValidFrequency, Frequency> {

    @Override
    public boolean isValid(Frequency frequency, ConstraintValidatorContext context) {
        // Frequency can be null (when recurring=false), validated at service level
        return true;
    }
}
