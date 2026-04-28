package com.splitbill.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "group_members")
@Data // Bắt buộc phải có dòng này để Lombok tự tạo ra các hàm setGroupId,
      // setUserId...
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "group_id")
    private String groupId;

    // --- THÊM 2 TRƯỜNG NÀY ĐỂ FIX LỖI Ở CONTROLLER ---

    @Column(name = "user_id")
    private String userId; // Nếu ID của Sếp kiểu số thì đổi String thành Long nhé

    @Column(name = "role")
    private String role;
}