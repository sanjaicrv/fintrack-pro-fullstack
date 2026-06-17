package com.budgetplanner.mapper;

import com.budgetplanner.dto.request.ExpenseRequest;
import com.budgetplanner.dto.response.ExpenseResponse;
import com.budgetplanner.entity.Expense;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-17T22:51:51+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ExpenseMapperImpl implements ExpenseMapper {

    @Override
    public Expense toEntity(ExpenseRequest request) {
        if ( request == null ) {
            return null;
        }

        Expense.ExpenseBuilder expense = Expense.builder();

        expense.amount( request.getAmount() );
        expense.category( request.getCategory() );
        expense.date( request.getDate() );
        expense.description( request.getDescription() );
        expense.frequency( request.getFrequency() );
        if ( request.getRecurring() != null ) {
            expense.recurring( request.getRecurring() );
        }

        return expense.build();
    }

    @Override
    public ExpenseResponse toResponse(Expense expense) {
        if ( expense == null ) {
            return null;
        }

        ExpenseResponse.ExpenseResponseBuilder expenseResponse = ExpenseResponse.builder();

        expenseResponse.amount( expense.getAmount() );
        expenseResponse.category( expense.getCategory() );
        expenseResponse.createdAt( expense.getCreatedAt() );
        expenseResponse.date( expense.getDate() );
        expenseResponse.description( expense.getDescription() );
        expenseResponse.frequency( expense.getFrequency() );
        expenseResponse.id( expense.getId() );
        expenseResponse.recurring( expense.isRecurring() );
        expenseResponse.updatedAt( expense.getUpdatedAt() );

        return expenseResponse.build();
    }

    @Override
    public List<ExpenseResponse> toResponseList(List<Expense> expenses) {
        if ( expenses == null ) {
            return null;
        }

        List<ExpenseResponse> list = new ArrayList<ExpenseResponse>( expenses.size() );
        for ( Expense expense : expenses ) {
            list.add( toResponse( expense ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromRequest(ExpenseRequest request, Expense expense) {
        if ( request == null ) {
            return;
        }

        if ( request.getAmount() != null ) {
            expense.setAmount( request.getAmount() );
        }
        if ( request.getCategory() != null ) {
            expense.setCategory( request.getCategory() );
        }
        if ( request.getDate() != null ) {
            expense.setDate( request.getDate() );
        }
        if ( request.getDescription() != null ) {
            expense.setDescription( request.getDescription() );
        }
        if ( request.getFrequency() != null ) {
            expense.setFrequency( request.getFrequency() );
        }
        if ( request.getRecurring() != null ) {
            expense.setRecurring( request.getRecurring() );
        }
    }
}
