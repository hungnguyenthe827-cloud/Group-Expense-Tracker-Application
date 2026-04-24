package com.splitbill.api.controller;

import com.splitbill.api.entity.Member;
import com.splitbill.api.repository.MemberRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/members") // Đã xóa /api ở đây vì context-path đã lo rồi
@CrossOrigin(origins = "*")
public class MemberController {

    private final MemberRepository repository;

    public MemberController(MemberRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Member> getAllMembers() {
        return repository.findAll();
    }

    @PostMapping
    public Member addMember(@RequestBody Member member) {
        return repository.save(member);
    }
}