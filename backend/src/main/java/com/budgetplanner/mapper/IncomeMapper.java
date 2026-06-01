package com.budgetplanner.mapper;

import com.budgetplanner.dto.request.IncomeRequest;
import com.budgetplanner.dto.response.IncomeResponse;
import com.budgetplanner.entity.Income;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IncomeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    // @Mapping(target = "createdAt", ignore = true)
    // @Mapping(target = "updatedAt", ignore = true)
    Income toEntity(IncomeRequest request);

    IncomeResponse toResponse(Income income);

    List<IncomeResponse> toResponseList(List<Income> incomes);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(IncomeRequest request, @MappingTarget Income income);
}
