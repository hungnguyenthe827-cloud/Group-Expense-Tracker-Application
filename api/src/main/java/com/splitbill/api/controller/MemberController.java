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
@CrossOrigin(origins = "*") // Đảm bảo Vercel kết nối được
public class MemberController {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private SettlementService settlementService;

    // ─── 1. LẤY DANH SÁCH THÀNH VIÊN TRONG NHÓM ──────────────────────
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupMember>> getMembersByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(groupMemberRepository.findByGroupId(groupId));
    }

    // ─── 2. THÊM THÀNH VIÊN MỚI (FIX LỖI KẾT NỐI KHI BẤM THÊM) ─────────
    @PostMapping
    public ResponseEntity<?> addMember(@RequestBody GroupMember member) {
        try {
            // Kiểm tra xem user này đã có trong nhóm chưa để tránh trùng lặp
            List<GroupMember> existing = groupMemberRepository.findByGroupId(member.getGroupId());
            boolean isExist = existing.stream()
                    .anyMatch(m -> m.getUserId().equals(member.getUserId()));
            
            if (isExist) {
                return ResponseEntity.badRequest().body("Thành viên này đã có trong nhóm!");
            }

            return ResponseEntity.ok(groupMemberRepository.save(member));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi thêm thành viên: " + e.getMessage());
        }
    }

    // ─── 3. TÍNH TOÁN NỢ NẦN (SETTLEMENT) ─────────────────────────────
    @GetMapping("/debts/{groupId}")
    public ResponseEntity<List<DebtResponse>> getGroupDebts(@PathVariable String groupId) {
        // Gọi bộ não SettlementService để tính toán
        return ResponseEntity.ok(settlementService.calculateSettlements(groupId));
    }

    // ─── 4. XÓA THÀNH VIÊN KHỎI NHÓM (DÙNG KHI CẦN) ───────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        try {
            groupMemberRepository.deleteById(id);
            return ResponseEntity.ok("Đã xóa thành viên");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi xóa: " + e.getMessage());
        }
    }
}