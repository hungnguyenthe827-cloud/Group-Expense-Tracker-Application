package com.splitbill.api.controller;

import com.splitbill.api.entity.Group;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.repository.GroupMemberRepository;
import com.splitbill.api.repository.GroupRepository;
import com.splitbill.api.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private EmailService emailService;

    // 1. Tạo nhóm mới & Thêm người tạo làm ADMIN
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Group groupReq) {
        String randomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        groupReq.setGroupCode(randomCode);
        Group savedGroup = groupRepository.save(groupReq);

        GroupMember adminMember = new GroupMember();
        adminMember.setGroupId(String.valueOf(savedGroup.getId()));
        adminMember.setUserId(String.valueOf(groupReq.getCreatedBy()));
        adminMember.setRole("ADMIN");
        adminMember.setName("Trưởng nhóm");
        groupMemberRepository.save(adminMember);

        return ResponseEntity.ok(savedGroup);
    }

    // 2. Tham gia nhóm bằng Mã (Join)
    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody Map<String, Object> payload) {
        String code = payload.get("joinCode").toString().toUpperCase();
        Long userId = Long.valueOf(payload.get("userId").toString());

        Optional<Group> groupOpt = groupRepository.findByGroupCode(code);
        if (!groupOpt.isPresent()) {
            return ResponseEntity.status(404).body("Không tìm thấy mã nhóm này!");
        }

        Group group = groupOpt.get();

        GroupMember newMember = new GroupMember();
        newMember.setGroupId(String.valueOf(group.getId()));
        newMember.setUserId(String.valueOf(userId));
        newMember.setRole("MEMBER");
        newMember.setName("Thành viên mới");

        groupMemberRepository.save(newMember);

        return ResponseEntity.ok(group);
    }

    // 3. Lấy danh sách nhóm của User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Group>> getUserGroups(@PathVariable Long userId) {
        List<Group> groups = groupRepository.findByCreatedBy(userId);
        return ResponseEntity.ok(groups);
    }

    // 4. Test gửi mail
    @GetMapping("/test-mail")
    public String testMail() {
        emailService.sendDebtReminder("email_nhan_thu@gmail.com", "Hệ thống PAYSHARE", 50000);
        return "Đã bắn mail thử nghiệm thành công! Sếp check inbox nhé.";
    }
}