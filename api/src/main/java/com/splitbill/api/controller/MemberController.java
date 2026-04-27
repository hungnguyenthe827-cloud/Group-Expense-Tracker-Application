package com.splitbill.api.controller;

import com.splitbill.api.entity.Member;
import com.splitbill.api.repository.MemberRepository;
import com.splitbill.api.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    private final MemberRepository repository;
    private final ExpenseRepository expenseRepository;

    // 1. Constructor khởi tạo cả 2 "thủ kho"
    public MemberController(MemberRepository repository, ExpenseRepository expenseRepository) {
        this.repository = repository;
        this.expenseRepository = expenseRepository;
    }

    // 2. Lấy danh sách thành viên THEO PHÒNG (groupId)
    @GetMapping
    public List<Member> getAll(@RequestParam String groupId) {
        return repository.findByGroupId(groupId);
    }

    // 3. Thêm thành viên mới (Lưu cả groupId đi kèm)
    @PostMapping
    public Member add(@RequestBody Member member) {
        return repository.save(member);
    }

    // 4. Xóa một thành viên cụ thể theo ID
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        repository.deleteById(id);
    }

    // 5. Reset: Chỉ xóa dữ liệu của đúng phòng (groupId) đó
    @DeleteMapping("/reset")
    public void reset(@RequestParam String groupId) {
        // Xóa các khoản chi của phòng này trước
        expenseRepository.deleteByGroupId(groupId);
        // Sau đó xóa các thành viên của phòng này
        repository.deleteByGroupId(groupId);
    }
}