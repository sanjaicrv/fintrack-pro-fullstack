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
    date = "2026-06-18T00:22:15+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class IncomeMapperImpl implements IncomeMapper {

    @Override
    public Income toEntity(IncomeRequest request) {
        if ( request == null ) {
            return null;
        }

        Income.IncomeBuilder income = Income.builder();

        income.source( request.getSource() );
        income.amount( request.getAmount() );
        income.date( request.getDate() );
        if ( request.getRecurring() != null ) {
            income.recurring( request.getRecurring() );
        }
        income.frequency( request.getFrequency() );

        return income.build();
    }

    @Override
    public IncomeResponse toResponse(Income income) {
        if ( income == null ) {
            return null;
        }

        IncomeResponse.IncomeResponseBuilder incomeResponse = IncomeResponse.builder();

        incomeResponse.id( income.getId() );
        incomeResponse.source( income.getSource() );
        incomeResponse.amount( income.getAmount() );
        incomeResponse.date( income.getDate() );
        incomeResponse.recurring( income.isRecurring() );
        incomeResponse.frequency( income.getFrequency() );
        incomeResponse.createdAt( income.getCreatedAt() );
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

        if ( request.getSource() != null ) {
            income.setSource( request.getSource() );
        }
        if ( request.getAmount() != null ) {
            income.setAmount( request.getAmount() );
        }
        if ( request.getDate() != null ) {
            income.setDate( request.getDate() );
        }
        if ( request.getRecurring() != null ) {
            income.setRecurring( request.getRecurring() );
        }
        if ( request.getFrequency() != null ) {
            income.setFrequency( request.getFrequency() );
        }
    }
}
