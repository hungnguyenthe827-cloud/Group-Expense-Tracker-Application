package com.splitbill.api.controller;

import com.splitbill.api.entity.Member;
import com.splitbill.api.repository.MemberRepository;
import com.splitbill.api.repository.ExpenseRepository; // 1. Đảm bảo có dòng này
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    private final MemberRepository repository;
    private final ExpenseRepository expenseRepository;

    // 2. Constructor PHẢI có đủ cả 2 repository như thế này
    public MemberController(MemberRepository repository, ExpenseRepository expenseRepository) {
        this.repository = repository;
        this.expenseRepository = expenseRepository;
    }

    @GetMapping
    public List<Member> getAllMembers() {
        return repository.findAll();
    }

    @PostMapping
    public Member addMember(@RequestBody Member member) {
        return repository.save(member);
    }

    @DeleteMapping("/{id}")
    public void deleteMember(@PathVariable String id) {
        repository.deleteById(id);
    }

    // 3. Hàm Reset xóa theo thứ tự để tránh lỗi khóa ngoại (Foreign Key)
    @DeleteMapping("/reset")
    public void resetAll() {
        expenseRepository.deleteAll(); // Xóa con trước (Khoản chi)
        repository.deleteAll(); // Xóa cha sau (Thành viên)
    }
}