package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.CreateExpenseRequest;
import com.expensetracker.backend.dto.ExpenseResponse;
import com.expensetracker.backend.security.CurrentUserResolver;
import com.expensetracker.backend.service.ExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final CurrentUserResolver currentUser;

    public ExpenseController(ExpenseService expenseService, CurrentUserResolver currentUser) {
        this.expenseService = expenseService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@PathVariable Long groupId,
                                                         @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createExpense(currentUser.resolveId(), groupId, req));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getExpenses(currentUser.resolveId(), groupId));
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> getExpense(@PathVariable Long groupId,
                                                      @PathVariable Long expenseId) {
        return ResponseEntity.ok(expenseService.getExpenseById(currentUser.resolveId(), groupId, expenseId));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(@PathVariable Long groupId,
                                                         @PathVariable Long expenseId,
                                                         @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.ok(expenseService.updateExpense(currentUser.resolveId(), groupId, expenseId, req));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long groupId,
                                              @PathVariable Long expenseId) {
        expenseService.deleteExpense(currentUser.resolveId(), groupId, expenseId);
        return ResponseEntity.noContent().build();
    }
}
