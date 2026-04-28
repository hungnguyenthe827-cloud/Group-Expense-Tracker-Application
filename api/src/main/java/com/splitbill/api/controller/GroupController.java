package com.splitbill.api.controller;

import com.splitbill.api.entity.Group;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.repository.GroupMemberRepository;
import com.splitbill.api.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Group groupReq) {
        try {
            // 1. Kiểm tra dữ liệu đầu vào
            if (groupReq.getCreatedBy() == null) {
                return ResponseEntity.badRequest().body("Lỗi: Không tìm thấy ID người tạo nhóm!");
            }

            // 2. Tạo mã nhóm ngẫu nhiên
            String randomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            groupReq.setGroupCode(randomCode);
            
            // 3. Lưu nhóm
            Group savedGroup = groupRepository.save(groupReq);

            // 4. Tự động thêm người tạo làm ADMIN
            GroupMember adminMember = new GroupMember();
            adminMember.setGroupId(String.valueOf(savedGroup.getId()));
            adminMember.setUserId(String.valueOf(groupReq.getCreatedBy()));
            adminMember.setRole("ADMIN");
            adminMember.setName("Trưởng nhóm");
            
            groupMemberRepository.save(adminMember);
            
            return ResponseEntity.ok(savedGroup);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo nhóm: " + e.getMessage());
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Chặn lỗi Frontend gửi thiếu dữ liệu
            if (!payload.containsKey("joinCode") || !payload.containsKey("userId")) {
                return ResponseEntity.badRequest().body("Lỗi: Thiếu mã nhóm hoặc thông tin người dùng!");
            }

            String code = payload.get("joinCode").toString().trim().toUpperCase();
            String userId = payload.get("userId").toString().trim();

            // 2. Tìm nhóm theo mã
            Optional<Group> groupOpt = groupRepository.findByGroupCode(code);
            if (groupOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Mã nhóm không tồn tại hoặc đã bị xóa!");
            }

            Group group = groupOpt.get();
            String groupIdStr = String.valueOf(group.getId());

            // 3. Kiểm tra user đã ở trong nhóm chưa (Tránh spam join)
            List<GroupMember> currentMembers = groupMemberRepository.findByGroupId(groupIdStr);
            boolean alreadyJoined = currentMembers.stream()
                    .anyMatch(m -> userId.equals(m.getUserId()));
            
            if (alreadyJoined) {
                return ResponseEntity.badRequest().body("Bạn đã là thành viên của nhóm này rồi!");
            }

            // 4. Thêm thành viên mới
            GroupMember newMember = new GroupMember();
            newMember.setGroupId(groupIdStr);
            newMember.setUserId(userId);
            newMember.setRole("MEMBER");
            newMember.setName("Thành viên " + userId.substring(0, Math.min(userId.length(), 4))); // Lấy 4 chữ cái đầu của ID làm tên tạm

            groupMemberRepository.save(newMember);
            
            return ResponseEntity.ok(group);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tham gia nhóm: " + e.getMessage());
        }
    }
}