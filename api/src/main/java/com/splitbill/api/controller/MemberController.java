package com.splitbill.api.controller;

import com.splitbill.api.dto.DebtResponse;
import com.splitbill.api.entity.Member;
import com.splitbill.api.repository.MemberRepository;
import com.splitbill.api.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping
    public ResponseEntity<List<Member>> getMembersByGroup(@RequestParam String groupId) {
        return ResponseEntity.ok(memberRepository.findByGroupId(groupId));
    }

    @PostMapping
    public ResponseEntity<Member> addMember(@RequestBody Member member) {
        return ResponseEntity.ok(memberRepository.save(member));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        memberRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // API cực mạnh: Reset xóa sạch mọi thứ của nhóm đó
    @DeleteMapping("/reset")
    public ResponseEntity<?> resetGroup(@RequestParam String groupId) {
        expenseRepository.deleteByGroupId(groupId);
        memberRepository.deleteByGroupId(groupId);
        return ResponseEntity.ok().build();
    }

    @Autowired
    private com.splitbill.api.service.SettlementService settlementService;

    @GetMapping("/{groupId}/settle")
    public ResponseEntity<List<DebtResponse>> getSettlement(@PathVariable String groupId) {
        return ResponseEntity.ok(settlementService.calculateSettlement(groupId));
    }
}