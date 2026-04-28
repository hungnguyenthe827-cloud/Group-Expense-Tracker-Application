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
        // 1. Tạo mã nhóm ngẫu nhiên
        String randomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        groupReq.setGroupCode(randomCode);

        // 2. Lưu nhóm
        Group savedGroup = groupRepository.save(groupReq);

        // 3. Tự động thêm người tạo làm ADMIN
        GroupMember adminMember = new GroupMember();
        adminMember.setGroupId(String.valueOf(savedGroup.getId()));
        adminMember.setUserId(String.valueOf(groupReq.getCreatedBy()));
        adminMember.setRole("ADMIN");
        adminMember.setName("Trưởng nhóm");

        groupMemberRepository.save(adminMember);

        return ResponseEntity.ok(savedGroup);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody Map<String, Object> payload) {
        String code = payload.get("joinCode").toString().toUpperCase();
        String userId = payload.get("userId").toString();

        Optional<Group> groupOpt = groupRepository.findByGroupCode(code);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Mã nhóm không tồn tại!");
        }

        Group group = groupOpt.get();

        GroupMember newMember = new GroupMember();
        newMember.setGroupId(String.valueOf(group.getId()));
        newMember.setUserId(userId);
        newMember.setRole("MEMBER");
        newMember.setName("Thành viên mới");

        groupMemberRepository.save(newMember);

        return ResponseEntity.ok(group);
    }
}