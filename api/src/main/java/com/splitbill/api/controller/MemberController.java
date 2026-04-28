package com.splitbill.api.controller;

import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.repository.GroupMemberRepository;
import com.splitbill.api.service.SettlementService;
import com.splitbill.api.dto.DebtResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private SettlementService settlementService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupMember>> getMembersByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(groupMemberRepository.findByGroupId(groupId));
    }

    @GetMapping("/debts/{groupId}")
    public ResponseEntity<List<DebtResponse>> getGroupDebts(@PathVariable String groupId) {
        return ResponseEntity.ok(settlementService.calculateSettlements(groupId));
    }
}