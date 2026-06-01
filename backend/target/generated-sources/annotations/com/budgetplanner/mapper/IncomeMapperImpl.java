package com.budgetplanner.mapper;

import com.budgetplanner.dto.request.IncomeRequest;
import com.budgetplanner.dto.response.IncomeResponse;
import com.budgetplanner.entity.Income;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-01T12:20:21+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260528-0407, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class IncomeMapperImpl implements IncomeMapper {

    @Override
    public Income toEntity(IncomeRequest request) {
        if ( request == null ) {
            return null;
        }

        Income.IncomeBuilder income = Income.builder();

        income.amount( request.getAmount() );
        income.date( request.getDate() );
        income.frequency( request.getFrequency() );
        if ( request.getRecurring() != null ) {
            income.recurring( request.getRecurring() );
        }
        income.source( request.getSource() );

        return income.build();
    }

    @Override
    public IncomeResponse toResponse(Income income) {
        if ( income == null ) {
            return null;
        }

        IncomeResponse.IncomeResponseBuilder incomeResponse = IncomeResponse.builder();

        incomeResponse.amount( income.getAmount() );
        incomeResponse.createdAt( income.getCreatedAt() );
        incomeResponse.date( income.getDate() );
        incomeResponse.frequency( income.getFrequency() );
        incomeResponse.id( income.getId() );
        incomeResponse.recurring( income.isRecurring() );
        incomeResponse.source( income.getSource() );
        incomeResponse.updatedAt( income.getUpdatedAt() );

        return incomeResponse.build();
    }

    @Override
    public List<IncomeResponse> toResponseList(List<Income> incomes) {
        if ( incomes == null ) {
            return null;
        }

        List<IncomeResponse> list = new ArrayList<IncomeResponse>( incomes.size() );
        for ( Income income : incomes ) {
            list.add( toResponse( income ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromRequest(IncomeRequest request, Income income) {
        if ( request == null ) {
            return;
        }

        if ( request.getAmount() != null ) {
            income.setAmount( request.getAmount() );
        }
        if ( request.getDate() != null ) {
            income.setDate( request.getDate() );
        }
        if ( request.getFrequency() != null ) {
            income.setFrequency( request.getFrequency() );
        }
        if ( request.getRecurring() != null ) {
            income.setRecurring( request.getRecurring() );
        }
        if ( request.getSource() != null ) {
            income.setSource( request.getSource() );
        }
    }
}
