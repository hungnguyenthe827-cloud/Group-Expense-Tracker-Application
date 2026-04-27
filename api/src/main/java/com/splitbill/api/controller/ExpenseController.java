package com.splitbill.api.controller;

import com.splitbill.api.entity.Expense;
import com.splitbill.api.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseRepository repository;

    public ExpenseController(ExpenseRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Expense> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Expense add(@RequestBody Expense expense) {
        if (expense.getCreatedAt() == null) {
            expense.setCreatedAt(System.currentTimeMillis());
        }
        return repository.save(expense);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}