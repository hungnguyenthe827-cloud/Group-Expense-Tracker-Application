package com.splitbill.api.controller;

import com.splitbill.api.entity.Expense;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping
    public ResponseEntity<List<Expense>> getExpensesByGroup(@RequestParam String groupId) {
        return ResponseEntity.ok(expenseRepository.findByGroupId(groupId));
    }

    @PostMapping
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        expenseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Autowired
    private EmailService emailService;

    // --- API BẤM NÚT ĐÒI NỢ ---
    @PostMapping("/remind")
    public ResponseEntity<?> remindDebt(@RequestBody Map<String, Object> payload) {
        String email = payload.get("email").toString();
        String fromName = payload.get("fromName").toString();
        long amount = Long.parseLong(payload.get("amount").toString());

        emailService.sendDebtReminder(email, fromName, amount);
        return ResponseEntity.ok(Map.of("message", "Đã gửi mail nhắc nợ thành công!"));
    }

}