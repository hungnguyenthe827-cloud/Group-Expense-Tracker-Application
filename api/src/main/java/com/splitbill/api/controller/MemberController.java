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

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupMember>> getMembers(@PathVariable String groupId) {
        return ResponseEntity.ok(groupMemberRepository.findByGroupId(groupId));
    }

    @GetMapping("/debts/{groupId}")
    public ResponseEntity<List<DebtResponse>> getDebts(@PathVariable String groupId) {
        return ResponseEntity.ok(settlementService.calculateSettlements(groupId));
    }
}