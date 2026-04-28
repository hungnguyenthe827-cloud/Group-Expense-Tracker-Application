package com.splitbill.api.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "group_members")
@Data
public class GroupMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groupId;
    private String userId;
    private String role; // ADMIN hoặc MEMBER
    private String name; // Tên hiển thị trong nhóm
}