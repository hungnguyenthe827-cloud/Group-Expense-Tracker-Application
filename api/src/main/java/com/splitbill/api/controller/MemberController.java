package com.splitbill.api.controller;

import com.splitbill.api.entity.Member;
import com.splitbill.api.repository.MemberRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*") // Cái này rất quan trọng: Cho phép Next.js gọi API mà không bị chặn (Lỗi CORS)
public class MemberController {

    private final MemberRepository repository;

    public MemberController(MemberRepository repository) {
        this.repository = repository;
    }

    // API 1: Lấy danh sách tất cả thành viên (Next.js sẽ gọi cái này khi mở web)
    @GetMapping
    public List<Member> getAllMembers() {
        return repository.findAll(); // Tự động moi tất cả dữ liệu từ bảng MEMBERS
    }

    // API 2: Thêm một thành viên mới (Next.js sẽ gọi cái này khi bạn bấm "Thêm")
    @PostMapping
    public Member addMember(@RequestBody Member member) {
        return repository.save(member); // Tự động lưu dữ liệu mới vào DB
    }
}