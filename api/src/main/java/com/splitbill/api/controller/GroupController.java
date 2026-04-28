package com.splitbill.api.controller;

import com.splitbill.api.entity.Group;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.entity.User;
import com.splitbill.api.repository.GroupMemberRepository;
import com.splitbill.api.repository.GroupRepository;
import com.splitbill.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*") // Mở cửa cho Vercel kết nối
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── 1. TẠO NHÓM MỚI (FIX LOGIC ADMIN) ───────────────────────────────
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            String createdBy = payload.get("createdBy").toString();

            if (name == null || name.isEmpty()) return ResponseEntity.badRequest().body("Tên nhóm không được để trống");

            // Tạo nhóm
            Group group = new Group();
            group.setName(name);
            group.setCreatedBy(Long.parseLong(createdBy));
            group.setGroupCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            Group savedGroup = groupRepository.save(group);

            // Tự động thêm người tạo làm ADMIN với tên thật
            Optional<User> userOpt = userRepository.findById(Long.parseLong(createdBy));
            GroupMember admin = new GroupMember();
            admin.setGroupId(String.valueOf(savedGroup.getId()));
            admin.setUserId(createdBy);
            admin.setRole("ADMIN");
            admin.setName(userOpt.isPresent() ? userOpt.get().getFullName() : "Trưởng nhóm");
            
            groupMemberRepository.save(admin);

            return ResponseEntity.ok(savedGroup);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo nhóm: " + e.getMessage());
        }
    }

    // ─── 2. THAM GIA NHÓM BẰNG MÃ (FIX LOGIC JOIN) ───────────────────────
    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody Map<String, Object> payload) {
        try {
            String code = payload.get("joinCode").toString().trim().toUpperCase();
            String userId = payload.get("userId").toString();

            Optional<Group> groupOpt = groupRepository.findByGroupCode(code);
            if (groupOpt.isEmpty()) return ResponseEntity.status(404).body("Mã nhóm không đúng!");

            Group group = groupOpt.get();
            String groupIdStr = String.valueOf(group.getId());

            // Check xem đã ở trong nhóm chưa
            boolean isJoined = groupMemberRepository.findByGroupId(groupIdStr).stream()
                    .anyMatch(m -> m.getUserId().equals(userId));
            if (isJoined) return ResponseEntity.badRequest().body("Sếp đã ở trong nhóm này rồi!");

            // Lấy tên thật của User để hiển thị cho đẹp
            Optional<User> userOpt = userRepository.findById(Long.parseLong(userId));
            
            GroupMember member = new GroupMember();
            member.setGroupId(groupIdStr);
            member.setUserId(userId);
            member.setRole("MEMBER");
            member.setName(userOpt.isPresent() ? userOpt.get().getFullName() : "Thành viên mới");

            groupMemberRepository.save(member);
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi join nhóm: " + e.getMessage());
        }
    }

    // ─── 3. LẤY DANH SÁCH NHÓM CỦA 1 USER (DÙNG CHO DASHBOARD) ──────────
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMyGroups(@PathVariable String userId) {
        try {
            // Tìm tất cả các record trong GroupMember có chứa userId này
            List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
            
            // Từ danh sách membership, lấy ra danh sách ID của các nhóm
            List<Long> groupIds = memberships.stream()
                    .map(m -> Long.parseLong(m.getGroupId()))
                    .collect(Collectors.toList());

            // Tìm thông tin chi tiết của các nhóm đó
            List<Group> myGroups = groupRepository.findAllById(groupIds);
            
            return ResponseEntity.ok(myGroups);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi lấy danh sách nhóm: " + e.getMessage());
        }
    }

    // ─── 4. LẤY THÔNG TIN CHI TIẾT 1 NHÓM QUA MÃ CODE ───────────────────
    @GetMapping("/{code}")
    public ResponseEntity<?> getGroupByCode(@PathVariable String code) {
        return groupRepository.findByGroupCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}