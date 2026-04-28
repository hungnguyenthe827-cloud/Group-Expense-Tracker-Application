package com.splitbill.api.controller;

import com.splitbill.api.entity.Expense;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.service.ExpenseService;
import com.splitbill.api.service.EmailService;
import com.splitbill.api.dto.MemberStat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private EmailService emailService;

    // 1. Tạo khoản chi tiêu mới
    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    // 2. Lấy danh sách chi tiêu theo nhóm
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getExpensesByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(expenseRepository.findByGroupId(groupId));
    }

    // 3. API lấy dữ liệu biểu đồ cho Sếp Kiệt
    @GetMapping("/stats/{groupId}")
    public ResponseEntity<List<MemberStat>> getGroupStats(@PathVariable String groupId) {
        return ResponseEntity.ok(expenseService.getGroupStats(groupId));
    }

    // 4. API đòi nợ qua Email
    @PostMapping("/remind-debt")
    public ResponseEntity<?> remindDebt(@RequestBody Map<String, Object> payload) {
        try {
            String email = (String) payload.get("email");
            String groupName = (String) payload.get("groupName");
            Long amount = Long.valueOf(payload.get("amount").toString());

            emailService.sendDebtReminder(email, groupName, amount);
            return ResponseEntity.ok("Đã bắn mail đòi nợ thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi gửi mail: " + e.getMessage());
        }
    }
}