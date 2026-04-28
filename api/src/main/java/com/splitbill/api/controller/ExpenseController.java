package com.splitbill.api.controller;

import com.splitbill.api.entity.Expense;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.service.ExpenseService;
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
    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Expense> create(@RequestBody Expense exp) {
        if (exp.getCreatedAt() == null)
            exp.setCreatedAt(System.currentTimeMillis());
        return ResponseEntity.ok(expenseRepository.save(exp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Expense req) {
        return expenseRepository.findById(id).map(old -> {
            old.setDescription(req.getDescription());
            old.setAmount(req.getAmount());
            old.setPaidBy(req.getPaidBy());
            old.setSplitBetween(req.getSplitBetween());
            return ResponseEntity.ok(expenseRepository.save(old));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        expenseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(expenseRepository.findByGroupId(groupId));
    }

    @GetMapping("/stats/{groupId}")
    public ResponseEntity<?> getStats(@PathVariable String groupId) {
        return ResponseEntity.ok(expenseService.getGroupStats(groupId));
    }
}