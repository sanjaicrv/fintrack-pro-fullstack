package com.budgetplanner.service;

import com.budgetplanner.dto.request.ExpenseRequest;
import com.budgetplanner.dto.response.ExpenseResponse;
import com.budgetplanner.entity.*;
import com.budgetplanner.exception.BadRequestException;
import com.budgetplanner.exception.ResourceNotFoundException;
import com.budgetplanner.mapper.ExpenseMapper;
import com.budgetplanner.repository.ExpenseRepository;
import com.budgetplanner.service.impl.ExpenseServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseMapper expenseMapper;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private User mockUser;
    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .role(User.Role.USER)
                .build();

        securityContext = Mockito.mock(SecurityContext.class);
        authentication = Mockito.mock(Authentication.class);

        Mockito.lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        Mockito.lenient().when(authentication.isAuthenticated()).thenReturn(true);
        Mockito.lenient().when(authentication.getPrincipal()).thenReturn(mockUser);

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("createExpense() — success: verify mapper called, user set on entity, repository save called, response returned")
    void createExpense_Success() {
        ExpenseRequest request = ExpenseRequest.builder()
                .category(ExpenseCategory.FOOD)
                .description("Groceries")
                .amount(BigDecimal.valueOf(100.00))
                .date(LocalDate.now())
                .recurring(false)
                .build();

        Expense mappedExpense = Expense.builder()
                .category(ExpenseCategory.FOOD)
                .description("Groceries")
                .amount(BigDecimal.valueOf(100.00))
                .date(LocalDate.now())
                .recurring(false)
                .build();

        Expense savedExpense = Expense.builder()
                .id(10L)
                .category(ExpenseCategory.FOOD)
                .description("Groceries")
                .amount(BigDecimal.valueOf(100.00))
                .date(LocalDate.now())
                .recurring(false)
                .user(mockUser)
                .build();

        ExpenseResponse expectedResponse = ExpenseResponse.builder()
                .id(10L)
                .category(ExpenseCategory.FOOD)
                .description("Groceries")
                .amount(BigDecimal.valueOf(100.00))
                .date(LocalDate.now())
                .recurring(false)
                .build();

        Mockito.when(expenseMapper.toEntity(request)).thenReturn(mappedExpense);
        Mockito.when(expenseRepository.save(mappedExpense)).thenReturn(savedExpense);
        Mockito.when(expenseMapper.toResponse(savedExpense)).thenReturn(expectedResponse);

        ExpenseResponse response = expenseService.createExpense(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(mockUser, mappedExpense.getUser());

        Mockito.verify(expenseMapper).toEntity(request);
        Mockito.verify(expenseRepository).save(mappedExpense);
        Mockito.verify(expenseMapper).toResponse(savedExpense);
    }

    @Test
    @DisplayName("createExpense() — throws BadRequestException when recurring=true and frequency=null")
    void createExpense_ThrowsBadRequestException_WhenRecurringTrueAndFrequencyNull() {
        ExpenseRequest request = ExpenseRequest.builder()
                .recurring(true)
                .frequency(null)
                .build();

        assertThrows(BadRequestException.class, () -> expenseService.createExpense(request));

        Mockito.verifyNoInteractions(expenseRepository);
        Mockito.verifyNoInteractions(expenseMapper);
    }

    @Test
    @DisplayName("getAllExpenses() — returns sorted list for current user")
    void getAllExpenses_ReturnsSortedList() {
        Expense e1 = Expense.builder().id(1L).date(LocalDate.of(2026, 6, 1)).build();
        Expense e2 = Expense.builder().id(2L).date(LocalDate.of(2026, 6, 3)).build();
        Expense e3 = Expense.builder().id(3L).date(LocalDate.of(2026, 6, 2)).build();

        List<Expense> mockExpenses = new ArrayList<>(List.of(e1, e2, e3));

        Mockito.when(expenseRepository.findByUserId(1L)).thenReturn(mockExpenses);

        List<ExpenseResponse> mockResponses = List.of(
                ExpenseResponse.builder().id(2L).date(LocalDate.of(2026, 6, 3)).build(),
                ExpenseResponse.builder().id(3L).date(LocalDate.of(2026, 6, 2)).build(),
                ExpenseResponse.builder().id(1L).date(LocalDate.of(2026, 6, 1)).build()
        );

        Mockito.when(expenseMapper.toResponseList(Mockito.anyList())).thenReturn(mockResponses);

        List<ExpenseResponse> responses = expenseService.getAllExpenses();

        assertNotNull(responses);
        assertEquals(3, responses.size());
        assertEquals(2L, responses.get(0).getId());
        assertEquals(3L, responses.get(1).getId());
        assertEquals(1L, responses.get(2).getId());

        // Verify that the list was sorted in-place before mapping
        assertEquals(2L, mockExpenses.get(0).getId());
        assertEquals(3L, mockExpenses.get(1).getId());
        assertEquals(1L, mockExpenses.get(2).getId());

        Mockito.verify(expenseRepository).findByUserId(1L);
        Mockito.verify(expenseMapper).toResponseList(mockExpenses);
    }

    @Test
    @DisplayName("getExpenseById() — success: returns response for correct user")
    void getExpenseById_Success() {
        Expense expense = Expense.builder()
                .id(10L)
                .user(mockUser)
                .build();

        ExpenseResponse expectedResponse = ExpenseResponse.builder()
                .id(10L)
                .build();

        Mockito.when(expenseRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(expense));
        Mockito.when(expenseMapper.toResponse(expense)).thenReturn(expectedResponse);

        ExpenseResponse response = expenseService.getExpenseById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());

        Mockito.verify(expenseRepository).findByIdAndUserId(10L, 1L);
        Mockito.verify(expenseMapper).toResponse(expense);
    }

    @Test
    @DisplayName("getExpenseById() — throws ResourceNotFoundException when ID belongs to different user")
    void getExpenseById_ThrowsResourceNotFoundException_WhenDifferentUserOrNotFound() {
        Mockito.when(expenseRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> expenseService.getExpenseById(10L));

        Mockito.verify(expenseRepository).findByIdAndUserId(10L, 1L);
        Mockito.verifyNoInteractions(expenseMapper);
    }

    @Test
    @DisplayName("updateExpense() — success: verify updateEntityFromRequest called and save called")
    void updateExpense_Success() {
        ExpenseRequest request = ExpenseRequest.builder()
                .category(ExpenseCategory.TRANSPORTATION)
                .description("Uber ride")
                .amount(BigDecimal.valueOf(25.50))
                .date(LocalDate.now())
                .recurring(false)
                .build();

        Expense existingExpense = Expense.builder()
                .id(10L)
                .category(ExpenseCategory.FOOD)
                .description("Groceries")
                .amount(BigDecimal.valueOf(100.00))
                .date(LocalDate.now())
                .recurring(false)
                .user(mockUser)
                .build();

        ExpenseResponse expectedResponse = ExpenseResponse.builder()
                .id(10L)
                .category(ExpenseCategory.TRANSPORTATION)
                .description("Uber ride")
                .amount(BigDecimal.valueOf(25.50))
                .date(LocalDate.now())
                .recurring(false)
                .build();

        Mockito.when(expenseRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(existingExpense));

        Mockito.doAnswer(invocation -> {
            ExpenseRequest req = invocation.getArgument(0);
            Expense exp = invocation.getArgument(1);
            exp.setCategory(req.getCategory());
            exp.setDescription(req.getDescription());
            exp.setAmount(req.getAmount());
            return null;
        }).when(expenseMapper).updateEntityFromRequest(request, existingExpense);

        Mockito.when(expenseRepository.save(existingExpense)).thenReturn(existingExpense);
        Mockito.when(expenseMapper.toResponse(existingExpense)).thenReturn(expectedResponse);

        ExpenseResponse response = expenseService.updateExpense(10L, request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(ExpenseCategory.TRANSPORTATION, existingExpense.getCategory());
        assertEquals("Uber ride", existingExpense.getDescription());
        assertEquals(BigDecimal.valueOf(25.50), existingExpense.getAmount());

        Mockito.verify(expenseRepository).findByIdAndUserId(10L, 1L);
        Mockito.verify(expenseMapper).updateEntityFromRequest(request, existingExpense);
        Mockito.verify(expenseRepository).save(existingExpense);
        Mockito.verify(expenseMapper).toResponse(existingExpense);
    }

    @Test
    @DisplayName("deleteExpense() — success: verify repository delete called")
    void deleteExpense_Success() {
        Expense expense = Expense.builder()
                .id(10L)
                .user(mockUser)
                .build();

        Mockito.when(expenseRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(expense));

        expenseService.deleteExpense(10L);

        Mockito.verify(expenseRepository).findByIdAndUserId(10L, 1L);
        Mockito.verify(expenseRepository).delete(expense);
    }

    @Test
    @DisplayName("deleteExpense() — throws ResourceNotFoundException when not found")
    void deleteExpense_ThrowsResourceNotFoundException_WhenNotFound() {
        Mockito.when(expenseRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> expenseService.deleteExpense(10L));

        Mockito.verify(expenseRepository).findByIdAndUserId(10L, 1L);
        Mockito.verify(expenseRepository, Mockito.never()).delete(Mockito.any());
    }
}
