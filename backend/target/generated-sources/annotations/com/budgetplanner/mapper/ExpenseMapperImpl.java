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
    date = "2026-06-18T00:09:56+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class ExpenseMapperImpl implements ExpenseMapper {

    @Override
    public Expense toEntity(ExpenseRequest request) {
        if ( request == null ) {
            return null;
        }

        Expense.ExpenseBuilder expense = Expense.builder();

        expense.category( request.getCategory() );
        expense.description( request.getDescription() );
        expense.amount( request.getAmount() );
        expense.date( request.getDate() );
        if ( request.getRecurring() != null ) {
            expense.recurring( request.getRecurring() );
        }
        expense.frequency( request.getFrequency() );

        return expense.build();
    }

    @Override
    public ExpenseResponse toResponse(Expense expense) {
        if ( expense == null ) {
            return null;
        }

        ExpenseResponse.ExpenseResponseBuilder expenseResponse = ExpenseResponse.builder();

        expenseResponse.id( expense.getId() );
        expenseResponse.category( expense.getCategory() );
        expenseResponse.description( expense.getDescription() );
        expenseResponse.amount( expense.getAmount() );
        expenseResponse.date( expense.getDate() );
        expenseResponse.recurring( expense.isRecurring() );
        expenseResponse.frequency( expense.getFrequency() );
        expenseResponse.createdAt( expense.getCreatedAt() );
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

        if ( request.getCategory() != null ) {
            expense.setCategory( request.getCategory() );
        }
        if ( request.getDescription() != null ) {
            expense.setDescription( request.getDescription() );
        }
        if ( request.getAmount() != null ) {
            expense.setAmount( request.getAmount() );
        }
        if ( request.getDate() != null ) {
            expense.setDate( request.getDate() );
        }
        if ( request.getRecurring() != null ) {
            expense.setRecurring( request.getRecurring() );
        }
        if ( request.getFrequency() != null ) {
            expense.setFrequency( request.getFrequency() );
        }
    }
}
