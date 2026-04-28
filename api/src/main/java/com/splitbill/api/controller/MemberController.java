package com.splitbill.api.controller;

import com.splitbill.api.dto.DebtResponse;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.service.SettlementService;
import com.splitbill.api.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    @Autowired
    private SettlementService settlementService;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    // --- CHỐT HẠ: Phải có cổng POST này thì Frontend mới Thêm người được ---
    @PostMapping
    public ResponseEntity<GroupMember> createMember(@RequestBody GroupMember member) {
        return ResponseEntity.ok(groupMemberRepository.save(member));
    }

    // --- CÁC CỔNG LẤY DỮ LIỆU CŨ ---
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupMember>> getMembers(@PathVariable String groupId) {
        return ResponseEntity.ok(groupMemberRepository.findByGroupId(groupId));
    }

    @GetMapping("/debts/{groupId}")
    public ResponseEntity<List<DebtResponse>> getDebts(@PathVariable String groupId) {
        return ResponseEntity.ok(settlementService.calculateSettlements(groupId));
    }
}