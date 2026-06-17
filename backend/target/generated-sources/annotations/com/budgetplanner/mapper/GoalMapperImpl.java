package com.budgetplanner.mapper;

import com.budgetplanner.dto.request.GoalRequest;
import com.budgetplanner.dto.response.GoalResponse;
import com.budgetplanner.entity.Goal;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-17T22:11:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class GoalMapperImpl implements GoalMapper {

    @Override
    public Goal toEntity(GoalRequest request) {
        if ( request == null ) {
            return null;
        }

        Goal.GoalBuilder goal = Goal.builder();

        goal.name( request.getName() );
        goal.targetAmount( request.getTargetAmount() );
        goal.currentAmount( request.getCurrentAmount() );
        goal.deadline( request.getDeadline() );

        return goal.build();
    }

    @Override
    public GoalResponse toResponse(Goal goal) {
        if ( goal == null ) {
            return null;
        }

        GoalResponse.GoalResponseBuilder goalResponse = GoalResponse.builder();

        goalResponse.id( goal.getId() );
        goalResponse.name( goal.getName() );
        goalResponse.targetAmount( goal.getTargetAmount() );
        goalResponse.currentAmount( goal.getCurrentAmount() );
        goalResponse.deadline( goal.getDeadline() );
        goalResponse.createdAt( goal.getCreatedAt() );
        goalResponse.updatedAt( goal.getUpdatedAt() );

        goalResponse.progressPercentage( calculateProgress(goal) );
        goalResponse.daysRemaining( calculateDaysRemaining(goal) );
        goalResponse.status( calculateStatus(goal) );

        return goalResponse.build();
    }

    @Override
    public List<GoalResponse> toResponseList(List<Goal> goals) {
        if ( goals == null ) {
            return null;
        }

        List<GoalResponse> list = new ArrayList<GoalResponse>( goals.size() );
        for ( Goal goal : goals ) {
            list.add( toResponse( goal ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromRequest(GoalRequest request, Goal goal) {
        if ( request == null ) {
            return;
        }

        if ( request.getName() != null ) {
            goal.setName( request.getName() );
        }
        if ( request.getTargetAmount() != null ) {
            goal.setTargetAmount( request.getTargetAmount() );
        }
        if ( request.getCurrentAmount() != null ) {
            goal.setCurrentAmount( request.getCurrentAmount() );
        }
        if ( request.getDeadline() != null ) {
            goal.setDeadline( request.getDeadline() );
        }
    }
}
