package com.splitbill.api.controller;

import com.splitbill.api.entity.Expense;
import com.splitbill.api.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*") // Mở cửa cho Vercel gọi vào
public class ExpenseController {

    private final ExpenseRepository repository;

    // Khởi tạo Thủ kho Khoản chi
    public ExpenseController(ExpenseRepository repository) {
        this.repository = repository;
    }

    // 1. Lấy danh sách chi tiêu NHƯNG PHẢI ĐÚNG PHÒNG (groupId)
    @GetMapping
    public List<Expense> getAll(@RequestParam("groupId") String groupId) {
        return repository.findByGroupId(groupId);
    }

    // 2. Thêm khoản chi mới (đã có sẵn groupId từ Frontend gửi xuống)
    @PostMapping
    public Expense add(@RequestBody Expense expense) {
        return repository.save(expense);
    }

    // 3. Xóa khoản chi theo ID
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}