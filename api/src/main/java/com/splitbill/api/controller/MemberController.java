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

    public MemberController(MemberRepository repository, ExpenseRepository expenseRepository) {
        this.repository = repository;
        this.expenseRepository = expenseRepository;
    }

    // Lấy thành viên NHƯNG chỉ lấy của đúng phòng đó
    @GetMapping
    public List<Member> getAll(@RequestParam String groupId) {
        return repository.findByGroupId(groupId);
    }

    @PostMapping
    public Member add(@RequestBody Member member) {
        return repository.save(member);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        repository.deleteById(id);
    }

    // Reset NHƯNG chỉ xóa dữ liệu của đúng phòng đó
    @DeleteMapping("/reset")
    public void reset(@RequestParam String groupId) {
        expenseRepository.deleteByGroupId(groupId);
        repository.deleteByGroupId(groupId);
    }
}